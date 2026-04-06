import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { Matches } from 'class-validator';
import { ContentBaseEntity } from '../../../core/base-domain-entity/content-base-entity';
import { SeoMetadata } from '../../../core/base-domain-entity/seo-metadata.vo';
import { LocalizedText } from './localized-text.vo';
import { CarouselImage } from './carousel-image.vo';

@Schema({ timestamps: true })
export class ClubEvent extends ContentBaseEntity {
  @Prop({ required: true, unique: true })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only latin letters, numbers and hyphens',
  })
  public slug: string;

  @Prop({ type: LocalizedText, required: true, _id: false })
  public title: LocalizedText;

  @Prop({ type: LocalizedText, required: true, _id: false })
  public content: LocalizedText;

  @Prop({ type: CarouselImage, _id: false })
  public cover?: CarouselImage;

  @Prop({ type: [CarouselImage], default: [], _id: false })
  public gallery?: CarouselImage[];

  @Prop({ type: SeoMetadata, _id: false })
  public seoMetadata: SeoMetadata;

  @Prop({ required: true })
  public startDate: Date;

  @Prop({ required: true })
  public endDate: Date;

  @Prop({ type: Number, default: null })
  public orderIndex?: number | null;

  @Prop({ default: 0 })
  public totalRatingValue: number;

  @Prop({ default: 0 })
  public totalReviewCount: number;

  public updateRating(newRating: number): void {
    this.totalRatingValue += newRating;
    this.totalReviewCount += 1;
  }

  public updateCover(image?: CarouselImage): void {
    this.cover = image;
  }

  public setGallery(images: CarouselImage[]): void {
    this.gallery = images;
  }
}

export const ClubEventSchema = SchemaFactory.createForClass(ClubEvent);
ClubEventSchema.loadClass(ClubEvent);

export type ClubEventDocument = HydratedDocument<ClubEvent>;
export type ClubEventModelType = Model<ClubEventDocument> & typeof ClubEvent;
