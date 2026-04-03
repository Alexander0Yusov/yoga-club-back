import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ContentBaseEntity } from '../../../core/base-domain-entity/content-base-entity';
import { LocalizedText } from './localized-text.vo';
import { CarouselImage } from './carousel-image.vo';

@Schema({ timestamps: true })
export class YogaDirection extends ContentBaseEntity {
  @Prop({ type: LocalizedText, required: true })
  public title: LocalizedText;

  @Prop({ type: LocalizedText, required: true })
  public text: LocalizedText;

  @Prop({ type: CarouselImage })
  public image?: CarouselImage;

  @Prop({ type: Number, default: null })
  public orderIndex?: number | null;
}

export const YogaDirectionSchema = SchemaFactory.createForClass(YogaDirection);
YogaDirectionSchema.loadClass(YogaDirection);

export type YogaDirectionDocument = HydratedDocument<YogaDirection>;
export type YogaDirectionModelType = Model<YogaDirectionDocument> & typeof YogaDirection;
