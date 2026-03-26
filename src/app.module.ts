import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { StagingModule } from "./staging/staging.module";

@Module({
  imports: [PrismaModule, AuthModule, StagingModule],
})
export class AppModule {}
