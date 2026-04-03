import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ContentBaseEntity } from '../../../core/base-domain-entity/content-base-entity';
import { LocalizedText } from './localized-text.vo';

export enum SectionContentType {
  REVIEWS = 'reviews',
  VIDEOS = 'videos',
  ADVANTAGES = 'advantages',
  PRACTICE_BENEFITS = 'practice_benefits',
  CLUB_EVENTS = 'club_events',
  ABOUT_ME_CARDS = 'about_me_cards',
  HERO_INTRO = 'hero_intro',
  YOGA_DIRECTIONS = 'yoga_directions',
  BOOKINGS = 'bookings',
  EVENT_REFS_PANEL = 'event_refs_panel',
}

@Schema({ timestamps: true })
export class Section extends ContentBaseEntity {
  @Prop({ type: LocalizedText, required: true })
  public title: LocalizedText;

  @Prop({ type: LocalizedText })
  public subtitle_1?: LocalizedText;

  @Prop({ type: LocalizedText })
  public subtitle_2?: LocalizedText;

  @Prop({ type: String, enum: SectionContentType, required: true })
  public for: SectionContentType;

  @Prop({ type: Number, default: 0 })
  public orderIndex: number;
}

export const SectionSchema = SchemaFactory.createForClass(Section);
SectionSchema.loadClass(Section);

export type SectionDocument = HydratedDocument<Section>;
export type SectionModelType = Model<SectionDocument> & typeof Section;
