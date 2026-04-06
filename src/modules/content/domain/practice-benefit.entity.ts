import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ContentBaseEntity } from '../../../core/base-domain-entity/content-base-entity';
import { LocalizedText } from './localized-text.vo';
import { CarouselImage } from './carousel-image.vo';

@Schema({ timestamps: true })
export class PracticeBenefit extends ContentBaseEntity {
  @Prop({ type: LocalizedText, required: true, _id: false })
  public text_1: LocalizedText;

  @Prop({ type: LocalizedText, _id: false })
  public text_2?: LocalizedText;

  @Prop({ type: LocalizedText, _id: false })
  public text_3?: LocalizedText;

  @Prop({ type: LocalizedText, _id: false })
  public text_4?: LocalizedText;

  @Prop({ type: LocalizedText, _id: false })
  public text_5?: LocalizedText;

  @Prop({ type: LocalizedText, _id: false })
  public text_6?: LocalizedText;

  @Prop({ type: LocalizedText, _id: false })
  public text_7?: LocalizedText;

  @Prop({ type: LocalizedText, _id: false })
  public text_8?: LocalizedText;

  @Prop({ type: LocalizedText, _id: false })
  public text_9?: LocalizedText;

  @Prop({ type: LocalizedText, _id: false })
  public text_10?: LocalizedText;

  @Prop({ type: CarouselImage, _id: false })
  public image?: CarouselImage;
}

export const PracticeBenefitSchema = SchemaFactory.createForClass(PracticeBenefit);
PracticeBenefitSchema.loadClass(PracticeBenefit);

export type PracticeBenefitDocument = HydratedDocument<PracticeBenefit>;
export type PracticeBenefitModelType = Model<PracticeBenefitDocument> & typeof PracticeBenefit;
