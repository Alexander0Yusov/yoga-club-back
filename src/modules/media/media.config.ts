import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty } from 'class-validator';
import { configValidationUtility } from '../../setup/config-validation.utility';

@Injectable()
export class MediaConfig {
  @IsNotEmpty({ message: 'Set CLOUD_NAME' })
  cloudName: string;

  @IsNotEmpty({ message: 'Set CLOUDINARY_API_KEY' })
  apiKey: string;

  @IsNotEmpty({ message: 'Set CLOUDINARY_API_SECRET' })
  apiSecret: string;

  constructor(private configService: ConfigService<any, true>) {
    this.cloudName = this.configService.get('CLOUD_NAME');
    this.apiKey = this.configService.get('CLOUDINARY_API_KEY');
    this.apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

    configValidationUtility.validateConfig(this);
  }
}
