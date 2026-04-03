import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ContentBaseEntity } from '../../../core/base-domain-entity/content-base-entity';
import { LocalizedText } from './localized-text.vo';
import { CarouselImage } from './carousel-image.vo';

@Schema({ timestamps: true })
export class HeroIntro extends ContentBaseEntity {
  @Prop({ type: LocalizedText, required: true })
  public title: LocalizedText;

  @Prop({ type: LocalizedText, required: true })
  public text1: LocalizedText;

  @Prop({ type: LocalizedText, required: true })
  public text2: LocalizedText;

  @Prop({ type: CarouselImage })
  public image?: CarouselImage;
}

export const HeroIntroSchema = SchemaFactory.createForClass(HeroIntro);
HeroIntroSchema.loadClass(HeroIntro);

export type HeroIntroDocument = HydratedDocument<HeroIntro>;
export type HeroIntroModelType = Model<HeroIntroDocument> & typeof HeroIntro;
