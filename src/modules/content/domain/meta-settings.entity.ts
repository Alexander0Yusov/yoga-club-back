import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { BaseDomainEntity } from '../../../core/base-domain-entity/base-domain-entity';
import { SeoMetadata } from '../../../core/base-domain-entity/seo-metadata.vo';

@Schema({ timestamps: true })
export class MetaSettings extends BaseDomainEntity {
  @Prop({ required: true, unique: true })
  public pageKey: string;

  @Prop({ type: SeoMetadata, _id: false })
  public seo: SeoMetadata;

  @Prop({ type: Number, default: 0 })
  public totalRatingValue: number;

  @Prop({ type: Number, default: 0 })
  public totalReviewCount: number;

  @Prop({ type: Object })
  public extraData?: Record<string, any>;

  updateRating(value: number) {
    this.totalRatingValue += value;
    this.totalReviewCount += 1;
  }
}

export const MetaSettingsSchema = SchemaFactory.createForClass(MetaSettings);
MetaSettingsSchema.loadClass(MetaSettings);

export type MetaSettingsDocument = HydratedDocument<MetaSettings>;
export type MetaSettingsModelType = Model<MetaSettingsDocument> & typeof MetaSettings;
