import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { MediaConfig } from '../media.config';
import * as streamifier from 'streamifier';

export interface CloudinaryResponse {
  url: string;
  publicId: string;
}

@Injectable()
export class CloudinaryService {
  constructor(private config: MediaConfig) {
    cloudinary.config({
      cloud_name: this.config.cloudName,
      api_key: this.config.apiKey,
      api_secret: this.config.apiSecret,
    });
  }

  async uploadImageWithDetails(file: Express.Multer.File, folder: string): Promise<CloudinaryResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { 
          folder,
          transformation: [{ quality: 'auto', fetch_format: 'auto', width: 1080 }],
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) return reject(new InternalServerErrorException(`Cloudinary upload failed: ${error.message}`));
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }

  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    const res = await this.uploadImageWithDetails(file, folder);
    return res.url;
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new InternalServerErrorException(`Cloudinary delete failed: ${error.message}`);
    }
  }
}
