import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ContentBaseEntity } from '../../../core/base-domain-entity/content-base-entity';
import { LocalizedText } from './localized-text.vo';

@Schema({ timestamps: true })
export class Review extends ContentBaseEntity {
  @Prop({ type: String, required: true })
  public authorId: string;

  @Prop({ type: LocalizedText, required: true, _id: false })
  public text: LocalizedText;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  public ratingValue: number;

  @Prop({ type: String, default: null })
  public eventId?: string | null;

  @Prop({ type: String, required: true })
  public originalLanguage: string;

  @Prop({ type: Number, default: null })
  public orderIndex?: number | null;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.loadClass(Review);

export type ReviewDocument = HydratedDocument<Review>;
export type ReviewModelType = Model<ReviewDocument> & typeof Review;
