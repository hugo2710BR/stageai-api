import {
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @Req() req: AuthRequest,
    @Body('planName') planName: string,
  ) {
    const url = await this.paymentsService.createCheckout(
      req.user.id,
      planName,
    );
    return { url };
  }

  @Post('webhook')
  async webhook(
    @Req() req: Request & { rawBody: Buffer },
    @Headers('x-signature') signature: string,
  ) {
    await this.paymentsService.handleWebhook(req.rawBody, signature);
    return { received: true };
  }
}
