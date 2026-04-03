import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { DemoVideoCardDocument, DemoVideoCardModelType } from '../domain/demo-video-card.entity';
import { DemoVideoCard } from '../domain/demo-video-card.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class DemoVideoCardRepository {
  constructor(
    @InjectModel(DemoVideoCard.name)
    private readonly model: DemoVideoCardModelType,
  ) {}

  async findById(id: string): Promise<DemoVideoCardDocument | null> {
    return this.model.findOne({ _id: id, deletedAt: null });
  }

  async findAll(): Promise<DemoVideoCardDocument[]> {
    return this.model.find({ deletedAt: null }).sort({ orderIndex: 1 });
  }

  async findActive(): Promise<DemoVideoCardDocument[]> {
    return this.model.find({ deletedAt: null, isActive: true }).sort({ orderIndex: 1 });
  }

  async getByIdOrNotFoundFail(id: string): Promise<DemoVideoCardDocument> {
    const card = await this.findById(id);
    if (!card) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'DemoVideoCard not found',
      });
    }
    return card;
  }

  async save(card: DemoVideoCardDocument): Promise<void> {
    await card.save();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id });
  }
}
