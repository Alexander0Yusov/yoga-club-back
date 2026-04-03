import { ApiProperty } from '@nestjs/swagger';
import { Prop } from '@nestjs/mongoose';

/**
 * BSON Embedded localized texts for MongoDB.
 */
export class LocalizedText {
  @ApiProperty({ example: 'Текст на русском' })
  @Prop({ required: true })
  public ru: string;

  @ApiProperty({ example: 'English text', required: false })
  @Prop()
  public en?: string;

  @ApiProperty({ example: 'Deutscher Text', required: false })
  @Prop()
  public de?: string;

  @ApiProperty({ example: 'Текст українською', required: false })
  @Prop()
  public uk?: string;

  constructor(ru: string, partial?: Partial<LocalizedText>) {
    this.ru = ru;
    if (partial) {
      this.en = partial.en;
      this.de = partial.de;
      this.uk = partial.uk;
    }
  }
}
