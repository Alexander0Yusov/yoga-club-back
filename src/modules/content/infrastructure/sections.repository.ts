import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { SectionDocument, SectionModelType } from '../domain/section.entity';
import { Section } from '../domain/section.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class SectionsRepository {
  constructor(
    @InjectModel(Section.name)
    private readonly model: SectionModelType,
  ) {}

  async findById(id: string): Promise<SectionDocument | null> {
    return this.model.findOne({ _id: id, deletedAt: null });
  }

  async findAll(): Promise<SectionDocument[]> {
    return this.model.find({ deletedAt: null }).sort({ orderIndex: 1 });
  }

  async findActive(): Promise<SectionDocument[]> {
    return this.model.find({ deletedAt: null, isActive: true }).sort({ orderIndex: 1 });
  }

  async getByIdOrNotFoundFail(id: string): Promise<SectionDocument> {
    const section = await this.findById(id);
    if (!section) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Section not found',
      });
    }
    return section;
  }

  async save(section: SectionDocument): Promise<void> {
    await section.save();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id });
  }
}
