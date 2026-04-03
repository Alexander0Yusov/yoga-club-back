import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { EventRefsPanelDocument, EventRefsPanelModelType } from '../domain/event-refs-panel.entity';
import { EventRefsPanel } from '../domain/event-refs-panel.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class EventRefsPanelRepository {
  constructor(
    @InjectModel(EventRefsPanel.name)
    private readonly model: EventRefsPanelModelType,
  ) {}

  async findById(id: string): Promise<EventRefsPanelDocument | null> {
    return this.model.findOne({ _id: id, deletedAt: null });
  }

  async findAll(): Promise<EventRefsPanelDocument[]> {
    return this.model.find({ deletedAt: null });
  }

  async findActive(): Promise<EventRefsPanelDocument[]> {
    return this.model.find({ deletedAt: null, isActive: true });
  }

  async getByIdOrNotFoundFail(id: string): Promise<EventRefsPanelDocument> {
    const doc = await this.findById(id);
    if (!doc) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'EventRefsPanel not found',
      });
    }
    return doc;
  }

  async save(doc: EventRefsPanelDocument): Promise<void> {
    await doc.save();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id });
  }
}
