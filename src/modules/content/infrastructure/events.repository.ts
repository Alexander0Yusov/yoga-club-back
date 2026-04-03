import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { ClubEventDocument, ClubEventModelType } from '../domain/club-event.entity';
import { ClubEvent } from '../domain/club-event.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class EventsRepository {
  constructor(
    @InjectModel(ClubEvent.name)
    private readonly model: ClubEventModelType,
  ) {}

  async findById(id: string): Promise<ClubEventDocument | null> {
    return this.model.findOne({ _id: id, deletedAt: null });
  }

  async findBySlug(slug: string): Promise<ClubEventDocument | null> {
    return this.model.findOne({ slug, deletedAt: null });
  }

  async findAll(): Promise<ClubEventDocument[]> {
    return this.model.find({ deletedAt: null }).sort({ orderIndex: 1 });
  }

  async findActive(): Promise<ClubEventDocument[]> {
    return this.model.find({ deletedAt: null, isActive: true }).sort({ orderIndex: 1 });
  }

  async getByIdOrNotFoundFail(id: string): Promise<ClubEventDocument> {
    const clubEvent = await this.findById(id);
    if (!clubEvent) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'ClubEvent not found',
      });
    }
    return clubEvent;
  }

  async save(event: ClubEventDocument): Promise<void> {
    await event.save();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id });
  }
}
