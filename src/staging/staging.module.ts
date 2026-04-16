import { Module } from "@nestjs/common";
import { StagingService } from "./staging.service";
import { StagingController } from "./staging.controller";
import { R2Module } from "../r2/r2.module";
import { FalModule } from "../fal/fal.module";

@Module({
  imports: [R2Module, FalModule],
  controllers: [StagingController],
  providers: [StagingService],
})
export class StagingModule {}
