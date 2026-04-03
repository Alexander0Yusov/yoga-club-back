import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { YogaDirectionDocument, YogaDirectionModelType } from '../domain/yoga-direction.entity';
import { YogaDirection } from '../domain/yoga-direction.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class YogaDirectionRepository {
  constructor(
    @InjectModel(YogaDirection.name)
    private readonly model: YogaDirectionModelType,
  ) {}

  async findById(id: string): Promise<YogaDirectionDocument | null> {
    return this.model.findOne({ _id: id, deletedAt: null });
  }

  async findAll(): Promise<YogaDirectionDocument[]> {
    return this.model.find({ deletedAt: null }).sort({ orderIndex: 1 });
  }

  async findActive(): Promise<YogaDirectionDocument[]> {
    return this.model.find({ deletedAt: null, isActive: true }).sort({ orderIndex: 1 });
  }

  async getByIdOrNotFoundFail(id: string): Promise<YogaDirectionDocument> {
    const direction = await this.findById(id);
    if (!direction) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'YogaDirection not found',
      });
    }
    return direction;
  }

  async save(direction: YogaDirectionDocument): Promise<void> {
    await direction.save();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id });
  }
}
