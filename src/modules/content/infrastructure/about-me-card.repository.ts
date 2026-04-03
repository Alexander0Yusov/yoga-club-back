import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { AboutMeCardDocument, AboutMeCardModelType } from '../domain/about-me-card.entity';
import { AboutMeCard } from '../domain/about-me-card.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class AboutMeCardRepository {
  constructor(
    @InjectModel(AboutMeCard.name)
    private readonly model: AboutMeCardModelType,
  ) {}

  async findById(id: string): Promise<AboutMeCardDocument | null> {
    return this.model.findOne({ _id: id, deletedAt: null });
  }

  async findAll(): Promise<AboutMeCardDocument[]> {
    return this.model.find({ deletedAt: null }).sort({ orderIndex: 1 });
  }

  async findActive(): Promise<AboutMeCardDocument[]> {
    return this.model.find({ deletedAt: null, isActive: true }).sort({ orderIndex: 1 });
  }

  async getByIdOrNotFoundFail(id: string): Promise<AboutMeCardDocument> {
    const card = await this.findById(id);
    if (!card) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'AboutMeCard not found',
      });
    }
    return card;
  }

  async save(card: AboutMeCardDocument): Promise<void> {
    await card.save();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id });
  }
}
