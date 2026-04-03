import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { AdvantageDocument, AdvantageModelType } from '../domain/advantage.entity';
import { Advantage } from '../domain/advantage.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class AdvantageRepository {
  constructor(
    @InjectModel(Advantage.name)
    private readonly model: AdvantageModelType,
  ) {}

  async findById(id: string): Promise<AdvantageDocument | null> {
    return this.model.findOne({ _id: id, deletedAt: null });
  }

  async findAll(): Promise<AdvantageDocument[]> {
    return this.model.find({ deletedAt: null }).sort({ orderIndex: 1 });
  }

  async findActive(): Promise<AdvantageDocument[]> {
    return this.model.find({ deletedAt: null, isActive: true }).sort({ orderIndex: 1 });
  }

  async getByIdOrNotFoundFail(id: string): Promise<AdvantageDocument> {
    const advantage = await this.findById(id);
    if (!advantage) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Advantage not found',
      });
    }
    return advantage;
  }

  async save(advantage: AdvantageDocument): Promise<void> {
    await advantage.save();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id });
  }
}
