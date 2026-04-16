import { Injectable } from '@nestjs/common';
// import Replicate from 'replicate'; // fallback — manter até Fal validado em prod
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { FalService } from '../fal/fal.service';
import { CreateStagingDto } from './dto/create-staging.dto';

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

  async create(userId: string, dto: CreateStagingDto) {
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

      // --- Replicate (fallback) ---
      // const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
      // const output = await replicate.run('black-forest-labs/flux-fill-pro', {
      //   input: { image: dto.image, mask: dto.mask, prompt: fullPrompt, steps: 50, guidance: 30, output_format: 'jpg', output_quality: 90, safety_tolerance: 2 },
      // });
      // const replicateUrl = String(Array.isArray(output) ? output[0] : output);

      // --- Fal AI ---
      const replicateUrl = await this.fal.inpaint(dto.image, dto.mask, fullPrompt);

      const r2Key = `stagings/${staging.id}.png`;
      const permanentUrl = await this.r2.uploadFromUrl(replicateUrl, r2Key);

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
