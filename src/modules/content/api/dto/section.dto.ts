import { IsOptional, ValidateNested, IsNumber, IsEnum, IsBoolean, IsObject, IsNotEmptyObject } from 'class-validator';
import { Type, Transform, plainToInstance, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LocalizedText } from '../../domain/localized-text.vo';
import { SectionContentType } from '../../domain/section.entity';

/**
 * Response DTO for Sections.
 */
export class SectionDto {
  @ApiProperty({ example: '65bb67ac42ad03d28512e', description: 'Unique section ID' })
  @Expose()
  public id: string;

  @ApiProperty({ 
    type: () => LocalizedText, 
    example: { ru: 'Направления йоги', en: 'Yoga Directions' } 
  })
  @Expose()
  public title: LocalizedText;

  @ApiProperty({ 
    type: () => LocalizedText, 
    required: false, 
    example: { ru: 'Выберите подходящую практику', en: 'Choose your practice' } 
  })
  @Expose()
  public subtitle_1?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @Expose()
  public subtitle_2?: LocalizedText;

  @ApiProperty({ enum: SectionContentType, example: SectionContentType.YOGA_DIRECTIONS })
  @Expose()
  public for: SectionContentType;

  @ApiProperty({ example: 0, description: 'Sorting order index' })
  @Expose()
  public orderIndex: number;

  @ApiProperty({ default: true })
  @Expose()
  public isActive: boolean;
}

export class CreateSectionDto {
  @ApiProperty({ 
    type: () => LocalizedText,
    example: { ru: 'Заголовок секции', en: 'Section Title' }
  })
  @Transform(({ value, key }) => {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) return null;
    return plainToInstance(LocalizedText, parsed);
  })
  @Type(() => LocalizedText)
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  public title: LocalizedText;

  @ApiProperty({ 
    type: () => LocalizedText, 
    required: false,
    example: { ru: 'Подзаголовок 1', en: 'Subtitle 1' }
  })
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) return null;
    return plainToInstance(LocalizedText, parsed);
  })
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public subtitle_1?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) return null;
    return plainToInstance(LocalizedText, parsed);
  })
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public subtitle_2?: LocalizedText;

  @ApiProperty({ enum: SectionContentType, example: SectionContentType.YOGA_DIRECTIONS })
  @IsEnum(SectionContentType)
  public for: SectionContentType;

  @ApiProperty({ example: 0, description: 'Sorting order index', required: false })
  @IsOptional()
  @IsNumber()
  public orderIndex?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}

export class UpdateSectionDto {
  @ApiProperty({ 
    type: () => LocalizedText, 
    required: false,
    example: { ru: 'Новый заголовок', en: 'New Title' }
  })
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) return null;
    return plainToInstance(LocalizedText, parsed);
  })
  @Type(() => LocalizedText)
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  public title?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) return null;
    return plainToInstance(LocalizedText, parsed);
  })
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public subtitle_1?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) return null;
    return plainToInstance(LocalizedText, parsed);
  })
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public subtitle_2?: LocalizedText;

  @ApiProperty({ enum: SectionContentType, required: false })
  @IsOptional()
  @IsEnum(SectionContentType)
  public for?: SectionContentType;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  public orderIndex?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}
