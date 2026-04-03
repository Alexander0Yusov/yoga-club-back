import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ContentBaseEntity } from '../../../core/base-domain-entity/content-base-entity';
import { LocalizedText } from './localized-text.vo';
import { CarouselImage } from './carousel-image.vo';

@Schema({ timestamps: true })
export class Advantage extends ContentBaseEntity {
  @Prop({ type: LocalizedText, required: true })
  public title: LocalizedText;

  @Prop({ type: LocalizedText, required: true })
  public text: LocalizedText;

  @Prop({ type: CarouselImage })
  public image?: CarouselImage;

  @Prop({ type: Number, default: null })
  public orderIndex?: number | null;
}

export const AdvantageSchema = SchemaFactory.createForClass(Advantage);
AdvantageSchema.loadClass(Advantage);

export type AdvantageDocument = HydratedDocument<Advantage>;
export type AdvantageModelType = Model<AdvantageDocument> & typeof Advantage;
