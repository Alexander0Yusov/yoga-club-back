import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ContentBaseEntity } from '../../../core/base-domain-entity/content-base-entity';
import { LocalizedText } from './localized-text.vo';
import { CarouselImage } from './carousel-image.vo';

@Schema({ timestamps: true })
export class HeroIntro extends ContentBaseEntity {
  @Prop({
    type: LocalizedText,
    required: true,
    _id: false,
    validate: [
      (val: any) => Object.keys(val || {}).length > 0,
      '{PATH} cannot be an empty object'
    ]
  })
  public title: LocalizedText;

  @Prop({
    type: LocalizedText,
    required: true,
    _id: false,
    validate: [
      (val: any) => Object.keys(val || {}).length > 0,
      '{PATH} cannot be an empty object'
    ]
  })
  public text1: LocalizedText;

  @Prop({
    type: LocalizedText,
    required: true,
    _id: false,
    validate: [
      (val: any) => Object.keys(val || {}).length > 0,
      '{PATH} cannot be an empty object'
    ]
  })
  public text2: LocalizedText;

  @Prop({ type: CarouselImage, _id: false })
  public image?: CarouselImage;

  @Prop({ type: Number, default: null })
  public orderIndex?: number | null;
}

export const HeroIntroSchema = SchemaFactory.createForClass(HeroIntro);
HeroIntroSchema.loadClass(HeroIntro);

export type HeroIntroDocument = HydratedDocument<HeroIntro>;
export type HeroIntroModelType = Model<HeroIntroDocument> & typeof HeroIntro;
