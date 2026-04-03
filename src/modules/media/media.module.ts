import { Module } from '@nestjs/common';
import { CloudinaryService } from './application/cloudinary.service';
import { MediaConfig } from './media.config';

@Module({
  providers: [MediaConfig, CloudinaryService],
  exports: [CloudinaryService],
})
export class MediaModule {}
