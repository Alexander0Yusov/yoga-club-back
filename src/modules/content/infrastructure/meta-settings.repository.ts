import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { MetaSettingsDocument, MetaSettingsModelType } from '../domain/meta-settings.entity';
import { MetaSettings } from '../domain/meta-settings.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class MetaSettingsRepository {
  constructor(
    @InjectModel(MetaSettings.name)
    private readonly model: MetaSettingsModelType,
  ) {}

  async findByPageKey(pageKey: string): Promise<MetaSettingsDocument | null> {
    return this.model.findOne({ pageKey });
  }

  async getByPageKeyOrNotFoundFail(pageKey: string): Promise<MetaSettingsDocument> {
    const settings = await this.findByPageKey(pageKey);
    if (!settings) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `MetaSettings for page "${pageKey}" not found`,
      });
    }
    return settings;
  }

  async save(settings: MetaSettingsDocument): Promise<void> {
    await settings.save();
  }

  async create(pageKey: string, partial: Partial<MetaSettings>): Promise<MetaSettingsDocument> {
    const settings = new this.model({ ...partial, pageKey });
    return settings.save();
  }
}
