import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  createCheckout,
  lemonSqueezySetup,
} from '@lemonsqueezy/lemonsqueezy.js';
import crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {
    lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });
  }

  async createCheckout(userId: string, planName: string): Promise<string> {
    const plan = await this.prisma.plan.findUnique({
      where: { name: planName },
    });

    if (!plan || !plan.lsVariantId) {
      throw new BadRequestException(
        'Plano inválido ou sem variante configurada',
      );
    }

    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      plan.lsVariantId,
      {
        checkoutData: {
          custom: { user_id: userId },
        },
      },
    );

    const url = checkout.data?.data.attributes.url;
    if (!url) throw new BadRequestException('Erro ao criar checkout');
    return url;
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (hmac !== signature) {
      throw new BadRequestException('Assinatura inválida');
    }

    const payload = JSON.parse(rawBody.toString()) as Record<string, unknown>;
    const meta = payload.meta as Record<string, unknown> | undefined;
    const eventName = meta?.event_name;
    if (eventName !== 'order_created') return;

    const customData = meta?.custom_data as Record<string, unknown> | undefined;
    const userId = customData?.user_id as string | undefined;

    const data = payload.data as Record<string, unknown> | undefined;
    const attributes = data?.attributes as Record<string, unknown> | undefined;
    const firstItem = attributes?.first_order_item as
      | Record<string, unknown>
      | undefined;
    const variantId = String(firstItem?.variant_id);

    if (!userId || !variantId) return;

    const plan = await this.prisma.plan.findFirst({
      where: { lsVariantId: variantId },
    });

    if (!plan) return;

    await this.prisma.user.update({
      where: { id: userId },
      data: { plan: plan.name },
    });
  }
}
