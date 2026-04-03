import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { ReviewDocument, ReviewModelType } from '../domain/review.entity';
import { Review } from '../domain/review.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectModel(Review.name)
    private readonly model: ReviewModelType,
  ) {}

  async findById(id: string): Promise<ReviewDocument | null> {
    return this.model.findOne({ _id: id, deletedAt: null });
  }

  async findAll(): Promise<ReviewDocument[]> {
    return this.model.find({ deletedAt: null }).sort({ orderIndex: 1 });
  }

  async findActive(): Promise<ReviewDocument[]> {
    return this.model.find({ deletedAt: null, isActive: true }).sort({ orderIndex: 1 });
  }

  async findByEventId(eventId: string): Promise<ReviewDocument[]> {
    return this.model.find({ eventId, deletedAt: null }).sort({ orderIndex: 1 });
  }

  async getByIdOrNotFoundFail(id: string): Promise<ReviewDocument> {
    const review = await this.findById(id);
    if (!review) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Review not found',
      });
    }
    return review;
  }

  async save(review: ReviewDocument): Promise<void> {
    await review.save();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id });
  }
}
