import { Injectable } from '@nestjs/common';
import { fal } from '@fal-ai/client';

@Injectable()
export class FalService {
  constructor() {
    fal.config({ credentials: process.env.FAL_KEY });
  }

  async generate(prompt: string, seed?: number): Promise<string> {
    const result = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt,
        image_size: 'landscape_4_3',
        num_inference_steps: 4,
        output_format: 'jpeg',
        ...(seed !== undefined && { seed }),
      },
    });

    const images = (result.data as { images: { url: string }[] }).images;
    if (!images || images.length === 0) {
      throw new Error('Fal returned no images');
    }
    return images[0].url;
  }

  async inpaint(
    imageBase64: string,
    maskBase64: string,
    prompt: string,
    seed?: number,
  ): Promise<string> {
    const imageBuffer = this.base64ToBuffer(imageBase64);
    const maskBuffer = this.base64ToBuffer(maskBase64);

    const imageUrl = await fal.storage.upload(
      new File([new Uint8Array(imageBuffer)], 'image.jpg', { type: 'image/jpeg' }),
    );

    const maskUrl = await fal.storage.upload(
      new File([new Uint8Array(maskBuffer)], 'mask.png', { type: 'image/png' }),
    );

    const result = await fal.subscribe('fal-ai/flux-pro/v1/fill', {
      input: {
        image_url: imageUrl,
        mask_url: maskUrl,
        prompt,
        safety_tolerance: '2' as const,
        output_format: 'jpeg',
        ...(seed !== undefined && { seed }),
      },
    });

    const images = (result.data as { images: { url: string }[] }).images;
    if (!images || images.length === 0) {
      throw new Error('Fal returned no images');
    }

    return images[0].url;
  }

  private base64ToBuffer(dataUrl: string): Buffer {
    const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
    return Buffer.from(base64, 'base64');
  }
}
