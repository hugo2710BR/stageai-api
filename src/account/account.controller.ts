import { Body, Controller, Delete, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountService } from './account.service';
import { IsString, MinLength } from 'class-validator';

class UpdateAccountDto {
  @IsString()
  @MinLength(1)
  name: string;
}

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get()
  get(@Req() req: AuthRequest) {
    return this.accountService.getAccount(req.user.id);
  }

  @Patch()
  update(@Req() req: AuthRequest, @Body() dto: UpdateAccountDto) {
    return this.accountService.updateAccount(req.user.id, dto.name);
  }

  @Delete()
  async remove(@Req() req: AuthRequest) {
    await this.accountService.deleteAccount(req.user.id);
    return { deleted: true };
  }
}
