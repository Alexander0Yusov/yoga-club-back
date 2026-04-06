import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ContentBaseEntity } from '../../../core/base-domain-entity/content-base-entity';
import { LocalizedText } from './localized-text.vo';
import { CarouselImage } from './carousel-image.vo';

@Schema({ timestamps: true })
export class DemoVideoCard extends ContentBaseEntity {
  @Prop({ type: LocalizedText, required: true, _id: false })
  public title: LocalizedText;

  @Prop({ type: LocalizedText, required: true, _id: false })
  public description: LocalizedText;

  @Prop({ type: String, required: true })
  public videoUrl: string;

  @Prop({ type: String, required: true })
  public embedUrl: string;

  @Prop({ type: CarouselImage, required: true, _id: false })
  public thumbnail: CarouselImage;

  @Prop({ type: Date })
  public publishedAt?: Date;

  @Prop({ type: String })
  public duration?: string;

  @Prop({ type: Number, default: null })
  public orderIndex?: number | null;
}

export const DemoVideoCardSchema = SchemaFactory.createForClass(DemoVideoCard);
DemoVideoCardSchema.loadClass(DemoVideoCard);

export type DemoVideoCardDocument = HydratedDocument<DemoVideoCard>;
export type DemoVideoCardModelType = Model<DemoVideoCardDocument> & typeof DemoVideoCard;
