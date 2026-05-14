import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StagingModule } from './staging/staging.module';
import { PlansModule } from './plans/plans.module';
import { PaymentsModule } from './payments/payments.module';
import { AccountModule } from './account/account.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    StagingModule,
    PlansModule,
    PaymentsModule,
    AccountModule,
  ],
})
export class AppModule {}
