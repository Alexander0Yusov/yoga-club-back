import { IsOptional, ValidateNested, IsNumber, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LocalizedText } from '../../domain/localized-text.vo';
import { SectionContentType } from '../../domain/section.entity';

export class CreateSectionDto {
  @ApiProperty({ type: () => LocalizedText })
  @ValidateNested()
  @Type(() => LocalizedText)
  public title: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public subtitle_1?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
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
  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public title?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public subtitle_1?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
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
