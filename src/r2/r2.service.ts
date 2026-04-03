import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.bucket = process.env.R2_BUCKET_NAME!;
    this.publicUrl = process.env.R2_PUBLIC_URL!;

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadFromUrl(imageUrl: string, key: string): Promise<string> {
    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: 'image/png',
      }),
    );

    return `${this.publicUrl}/${key}`;
  }
}
