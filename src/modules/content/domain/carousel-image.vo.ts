import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema } from '@nestjs/mongoose';
import { LocalizedText } from './localized-text.vo';

/**
 * Standard image value object with Localized alt and publicId.
 */
@Schema({ _id: false })
export class CarouselImage {
  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v1/yoga/sample.jpg' })
  @Prop({ required: true })
  public url: string;

  @ApiProperty({ type: () => LocalizedText, description: 'Localized alt text' })
  @Prop({ type: LocalizedText, _id: false })
  public alt?: LocalizedText;

  @ApiProperty({ example: 'yoga/sample', required: false, description: 'Public ID from Cloudinary' })
  @Prop()
  public publicId?: string;

  constructor(url: string, alt?: LocalizedText, publicId?: string) {
    this.url = url;
    this.alt = alt;
    this.publicId = publicId;
  }
}
