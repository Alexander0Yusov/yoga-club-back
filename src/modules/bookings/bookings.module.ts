import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './domain/booking.entity';
import { BookingsRepository } from './infrastructure/bookings.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
  ],
  providers: [BookingsRepository],
  exports: [MongooseModule, BookingsRepository],
})
export class BookingsModule {}
