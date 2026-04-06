import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema } from '@nestjs/mongoose';
import { IsOptional, ValidateNested, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { LocalizedText } from '../../modules/content/domain/localized-text.vo';

@Schema({ _id: false })
export class SeoMetadata {
  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  @Prop({ type: LocalizedText, _id: false })
  public title?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  @Prop({ type: LocalizedText, _id: false })
  public description?: LocalizedText;

  @ApiProperty({ example: 'https://cloudinary.com/seo.jpg', required: false })
  @IsOptional()
  @IsUrl()
  @Prop()
  public imageUrl?: string;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  @Prop({ type: LocalizedText, _id: false })
  public alt?: LocalizedText;

  constructor(partial?: Partial<SeoMetadata>) {
    if (partial) {
      this.title = partial.title;
      this.description = partial.description;
      this.imageUrl = partial.imageUrl;
      this.alt = partial.alt;
    }
  }
}
