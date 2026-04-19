import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// import Replicate from 'replicate'; // fallback — manter até Fal validado em prod
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { FalService } from '../fal/fal.service';
import { CreateStagingDto } from './dto/create-staging.dto';

const PLAN_LIMITS: Record<string, number> = {
  free: 3,
  starter: 30,
  pro: 100,
  agency: Infinity,
};

const STYLE_PROMPTS: Record<string, string> = {
  Moderno:
    'modern interior design, clean lines, neutral tones, contemporary furniture, minimalist decor',
  Escandinavo:
    'scandinavian interior design, light wood furniture, white walls, cozy hygge atmosphere, natural materials',
  Industrial:
    'industrial interior design, exposed brick, metal accents, dark tones, loft style, raw concrete',
  Mediterrâneo:
    'mediterranean interior design, warm terracotta tones, natural textures, arched details, bright airy space',
};

@Injectable()
export class StagingService {
  constructor(
    private prisma: PrismaService,
    private r2: R2Service,
    private fal: FalService,
  ) {}

  private async checkLimit(userId: string, plan: string): Promise<void> {
    const limit = PLAN_LIMITS[plan] ?? 3;
    if (limit === Infinity) return;

    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const count = await this.prisma.staging.count({
      where: { userId, createdAt: { gte: start } },
    });

    if (count >= limit) {
      throw new HttpException(
        `Limite de ${limit} gerações/mês atingido.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async create(userId: string, dto: CreateStagingDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    await this.checkLimit(userId, user!.plan);

    const staging = await this.prisma.staging.create({
      data: {
        userId,
        style: dto.style,
        prompt: dto.prompt,
        imageUrl: null,
        status: 'processing',
      },
    });

    try {
      const stylePrompt = STYLE_PROMPTS[dto.style] || STYLE_PROMPTS['Moderno'];
      const fullPrompt = dto.prompt
        ? `${dto.prompt}, ${stylePrompt}`
        : stylePrompt;

      const falUrl = await this.fal.inpaint(dto.image, dto.mask, fullPrompt);

      const r2Key = `stagings/${staging.id}.png`;
      const permanentUrl = await this.r2.uploadFromUrl(falUrl, r2Key);

      await this.prisma.staging.update({
        where: { id: staging.id },
        data: { resultUrl: permanentUrl, status: 'completed' },
      });

      return { result: permanentUrl };
    } catch (error) {
      await this.prisma.staging.update({
        where: { id: staging.id },
        data: { status: 'failed' },
      });
      throw error;
    }
  }

  async getUsage(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const plan = user!.plan;
    const limit = PLAN_LIMITS[plan] ?? 3;

    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const used = await this.prisma.staging.count({
      where: { userId, createdAt: { gte: start } },
    });

    return {
      plan,
      used,
      limit: limit === Infinity ? null : limit,
      remaining: limit === Infinity ? null : Math.max(0, limit - used),
    };
  }

  async findAllByUser(userId: string) {
    return this.prisma.staging.findMany({
      where: { userId, status: 'completed' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(userId: string, stagingId: string) {
    const staging = await this.prisma.staging.findFirst({
      where: { id: stagingId, userId },
    });

    if (!staging) throw new Error('Staging não encontrado');

    if (staging.resultUrl) {
      const key = staging.resultUrl.split('/').slice(-2).join('/');
      await this.r2.deleteObject(key);
    }

    await this.prisma.staging.delete({ where: { id: stagingId } });
  }
}
