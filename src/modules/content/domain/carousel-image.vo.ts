import { Prop } from '@nestjs/mongoose';
import { LocalizedText } from './localized-text.vo';

/**
 * Standard image value object with Localized alt and publicId.
 */
export class CarouselImage {
  @Prop({ required: true })
  public url: string;

  @Prop({ type: LocalizedText })
  public alt?: LocalizedText;

  @Prop()
  public publicId?: string;

  constructor(url: string, alt?: LocalizedText, publicId?: string) {
    this.url = url;
    this.alt = alt;
    this.publicId = publicId;
  }
}
