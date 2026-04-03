import { Prop } from '@nestjs/mongoose';

export abstract class BaseDomainEntity {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date | null;

  @Prop({ type: Date, default: null })
  public deletedAt: Date | null;

  constructor() {
    this.deletedAt = null;
  }

  public softDelete(): void {
    this.deletedAt = new Date();
  }

  public restore(): void {
    this.deletedAt = null;
  }
}
