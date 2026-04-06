import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ContentBaseEntity } from '../../../core/base-domain-entity/content-base-entity';

import { LocalizedText } from './localized-text.vo';

import { CarouselImage } from './carousel-image.vo';

export class CardBlock {
  @Prop({ type: LocalizedText, _id: false })
  public title?: LocalizedText;

  @Prop({ type: LocalizedText, _id: false })
  public text?: LocalizedText;

  @Prop({ type: CarouselImage, _id: false })
  public image?: CarouselImage;
}

@Schema({ timestamps: true })
export class AboutMeCard extends ContentBaseEntity {
  @Prop({ type: CardBlock, _id: false })
  public left?: CardBlock;

  @Prop({ type: CardBlock, _id: false })
  public right?: CardBlock;

  @Prop({ type: Number, default: null })
  public orderIndex?: number | null;
}

export const AboutMeCardSchema = SchemaFactory.createForClass(AboutMeCard);
AboutMeCardSchema.loadClass(AboutMeCard);

export type AboutMeCardDocument = HydratedDocument<AboutMeCard>;
export type AboutMeCardModelType = Model<AboutMeCardDocument> & typeof AboutMeCard;
