import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { MinLength, MaxLength, IsOptional } from 'class-validator';
import { BaseDomainEntity } from '../../../core/base-domain-entity/base-domain-entity';
import { BookingStatus } from './booking-status.enum';

@Schema({ timestamps: true })
export class Booking extends BaseDomainEntity {
  @Prop({ type: String, required: true })
  public userId: string;

  @Prop({ type: String, required: true })
  public eventId: string;

  @Prop({ type: String })
  @IsOptional()
  @MinLength(2)
  @MaxLength(30)
  public comment?: string;

  @Prop({
    type: String,
    enum: Object.values(BookingStatus),
    default: BookingStatus.Pending,
  })
  public status: BookingStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.loadClass(Booking);

export type BookingDocument = HydratedDocument<Booking>;
export type BookingModelType = Model<BookingDocument> & typeof Booking;
