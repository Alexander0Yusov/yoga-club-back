import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { BookingDocument, BookingModelType } from '../domain/booking.entity';
import { Booking } from '../domain/booking.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class BookingsRepository {
  constructor(
    @InjectModel(Booking.name)
    private readonly model: BookingModelType,
  ) {}

  async findById(id: string): Promise<BookingDocument | null> {
    return this.model.findById(id);
  }

  async findAll(): Promise<BookingDocument[]> {
    return this.model.find().sort({ createdAt: -1 });
  }

  async findByUserId(userId: string): Promise<BookingDocument[]> {
    return this.model.find({ userId }).sort({ createdAt: -1 });
  }

  async findByEventId(eventId: string): Promise<BookingDocument[]> {
    return this.model.find({ eventId }).sort({ createdAt: -1 });
  }

  async getByIdOrNotFoundFail(id: string): Promise<BookingDocument> {
    const booking = await this.findById(id);
    if (!booking) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Booking not found',
      });
    }
    return booking;
  }

  async save(booking: BookingDocument): Promise<void> {
    await booking.save();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id });
  }
}
