import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { StagingService } from "./staging.service";
import { CreateStagingDto } from "./dto/create-staging.dto";

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@Controller("staging")
@UseGuards(JwtAuthGuard)
export class StagingController {
  constructor(private stagingService: StagingService) {}

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreateStagingDto) {
    return this.stagingService.create(req.user.id, dto);
  }

  @Get('usage')
  getUsage(@Req() req: AuthRequest) {
    return this.stagingService.getUsage(req.user.id);
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.stagingService.findAllByUser(req.user.id);
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.stagingService.remove(req.user.id, id);
  }
}
