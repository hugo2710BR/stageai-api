import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private r2: R2Service,
  ) {}

  async getAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpException('Utilizador não encontrado', HttpStatus.NOT_FOUND);

    const plan = await this.prisma.plan.findUnique({ where: { name: user.plan } });
    const limit = plan?.limit ?? null;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const start =
      user.planUpgradedAt && user.planUpgradedAt > monthStart
        ? user.planUpgradedAt
        : monthStart;

    const used = await this.prisma.staging.count({
      where: { userId, createdAt: { gte: start }, status: { not: 'failed' } },
    });

    return {
      name: user.name,
      email: user.email,
      plan: user.plan,
      planDisplayName: plan?.displayName ?? user.plan,
      planUpgradedAt: user.planUpgradedAt,
      used,
      limit,
      remaining: limit === null ? null : Math.max(0, limit - used),
    };
  }

  async updateAccount(userId: string, name: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name },
    });
    return { name: user.name };
  }

  async deleteAccount(userId: string) {
    const stagings = await this.prisma.staging.findMany({
      where: { userId, resultUrl: { not: null } },
      select: { resultUrl: true },
    });

    await Promise.allSettled(
      stagings
        .filter((s) => s.resultUrl)
        .map((s) => {
          const key = s.resultUrl!.split('/').slice(-2).join('/');
          return this.r2.deleteObject(key);
        }),
    );

    await this.prisma.user.delete({ where: { id: userId } });
  }
}
