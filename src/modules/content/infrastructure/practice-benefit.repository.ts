import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { PracticeBenefitDocument, PracticeBenefitModelType } from '../domain/practice-benefit.entity';
import { PracticeBenefit } from '../domain/practice-benefit.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class PracticeBenefitRepository {
  constructor(
    @InjectModel(PracticeBenefit.name)
    private readonly model: PracticeBenefitModelType,
  ) {}

  async findById(id: string): Promise<PracticeBenefitDocument | null> {
    return this.model.findOne({ _id: id, deletedAt: null });
  }

  async findAll(): Promise<PracticeBenefitDocument[]> {
    return this.model.find({ deletedAt: null }).sort({ orderIndex: 1 });
  }

  async findActive(): Promise<PracticeBenefitDocument[]> {
    return this.model.find({ deletedAt: null, isActive: true }).sort({ orderIndex: 1 });
  }

  async getByIdOrNotFoundFail(id: string): Promise<PracticeBenefitDocument> {
    const benefit = await this.findById(id);
    if (!benefit) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'PracticeBenefit not found',
      });
    }
    return benefit;
  }

  async save(benefit: PracticeBenefitDocument): Promise<void> {
    await benefit.save();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id });
  }
}
