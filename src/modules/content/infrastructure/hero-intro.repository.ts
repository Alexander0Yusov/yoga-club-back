import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { HeroIntroDocument, HeroIntroModelType } from '../domain/hero-intro.entity';
import { HeroIntro } from '../domain/hero-intro.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class HeroIntroRepository {
  constructor(
    @InjectModel(HeroIntro.name)
    private readonly model: HeroIntroModelType,
  ) {}

  async findById(id: string): Promise<HeroIntroDocument | null> {
    return this.model.findOne({ _id: id, deletedAt: null });
  }

  async findAll(): Promise<HeroIntroDocument[]> {
    return this.model.find({ deletedAt: null }).sort({ orderIndex: 1 });
  }

  async findActive(): Promise<HeroIntroDocument[]> {
    return this.model.find({ deletedAt: null, isActive: true }).sort({ orderIndex: 1 });
  }

  async getByIdOrNotFoundFail(id: string): Promise<HeroIntroDocument> {
    const heroIntro = await this.findById(id);
    if (!heroIntro) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'HeroIntro not found',
      });
    }
    return heroIntro;
  }

  async save(heroIntro: HeroIntroDocument): Promise<void> {
    await heroIntro.save();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id });
  }
}
