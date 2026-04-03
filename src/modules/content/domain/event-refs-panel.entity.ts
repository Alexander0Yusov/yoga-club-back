import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ContentBaseEntity } from '../../../core/base-domain-entity/content-base-entity';
import { CarouselImage } from './carousel-image.vo';

@Schema({ timestamps: true })
export class EventRefsPanel extends ContentBaseEntity {
  @Prop({ type: CarouselImage, required: true })
  public leftRefImage: CarouselImage;

  @Prop({ type: CarouselImage, required: true })
  public rightRefImage: CarouselImage;
}

export const EventRefsPanelSchema = SchemaFactory.createForClass(EventRefsPanel);
EventRefsPanelSchema.loadClass(EventRefsPanel);

export type EventRefsPanelDocument = HydratedDocument<EventRefsPanel>;
export type EventRefsPanelModelType = Model<EventRefsPanelDocument> & typeof EventRefsPanel;
