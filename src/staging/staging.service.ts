import { Injectable } from "@nestjs/common";
import Replicate from "replicate";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStagingDto } from "./dto/create-staging.dto";

const STYLE_PROMPTS: Record<string, string> = {
  Moderno:
    "modern interior design, clean lines, neutral tones, contemporary furniture, minimalist decor",
  Escandinavo:
    "scandinavian interior design, light wood furniture, white walls, cozy hygge atmosphere, natural materials",
  Industrial:
    "industrial interior design, exposed brick, metal accents, dark tones, loft style, raw concrete",
  "Mediterrâneo":
    "mediterranean interior design, warm terracotta tones, natural textures, arched details, bright airy space",
};

const NEGATIVE_PROMPT =
  "blurry, low quality, distorted, unrealistic, cartoon, painting, watermark, text";

@Injectable()
export class StagingService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateStagingDto) {
    const staging = await this.prisma.staging.create({
      data: {
        userId,
        style: dto.style,
        prompt: dto.prompt,
        imageUrl: dto.image.substring(0, 100),
        status: "processing",
      },
    });

    try {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      const stylePrompt = STYLE_PROMPTS[dto.style] || STYLE_PROMPTS["Moderno"];
      const fullPrompt = dto.prompt
        ? `${stylePrompt}, ${dto.prompt}`
        : stylePrompt;

      const output = await replicate.run(
        "stability-ai/stable-diffusion-inpainting:95b7223104132402a9ae91cc677285bc5eb997834bd2349fa486f53910fd68b3",
        {
          input: {
            image: dto.image,
            mask: dto.mask,
            prompt: fullPrompt,
            negative_prompt: NEGATIVE_PROMPT,
            num_inference_steps: 25,
            guidance_scale: 7.5,
            scheduler: "DPMSolverMultistep",
          },
        },
      );

      const resultUrl = Array.isArray(output) ? output[0] : output;

      await this.prisma.staging.update({
        where: { id: staging.id },
        data: { resultUrl: resultUrl as string, status: "completed" },
      });

      return { result: resultUrl };
    } catch (error) {
      await this.prisma.staging.update({
        where: { id: staging.id },
        data: { status: "failed" },
      });
      throw error;
    }
  }

  async findAllByUser(userId: string) {
    return this.prisma.staging.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
