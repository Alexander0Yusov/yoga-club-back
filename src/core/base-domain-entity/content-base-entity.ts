import { Prop } from '@nestjs/mongoose';
import { BaseDomainEntity } from './base-domain-entity';

export abstract class ContentBaseEntity extends BaseDomainEntity {
  @Prop({ type: Boolean, default: true })
  public isActive: boolean;

  constructor() {
    super();
    this.isActive = true;
  }

  public softDelete(): void {
    super.softDelete();
    this.isActive = false;
  }

  public restore(): void {
    super.restore();
    this.isActive = true;
  }
}
