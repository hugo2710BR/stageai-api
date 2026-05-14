import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { R2Module } from '../r2/r2.module';

@Module({
  imports: [R2Module],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
