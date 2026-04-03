import { IsOptional, ValidateNested, IsString, IsInt, Min, Max, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LocalizedText } from '../../domain/localized-text.vo';

export class CreateReviewDto {
  @ApiProperty({ example: 'u123' })
  @IsString()
  public authorId: string;

  @ApiProperty({ type: () => LocalizedText })
  @ValidateNested()
  @Type(() => LocalizedText)
  public text: LocalizedText;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  public ratingValue: number;

  @ApiProperty({ example: 'e999', required: false, nullable: true })
  @IsOptional()
  @IsString()
  public eventId?: string | null;

  @ApiProperty({ example: 'ru' })
  @IsString()
  public originalLanguage: string;

  @ApiProperty({ example: 0, required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  public orderIndex?: number | null;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}

export class UpdateReviewDto {
  @ApiProperty({ example: 'u123', required: false })
  @IsOptional()
  @IsString()
  public authorId?: string;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text?: LocalizedText;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  public ratingValue?: number;

  @ApiProperty({ example: 'e999', required: false, nullable: true })
  @IsOptional()
  @IsString()
  public eventId?: string | null;

  @ApiProperty({ example: 'ru', required: false })
  @IsOptional()
  @IsString()
  public originalLanguage?: string;

  @ApiProperty({ example: 0, required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  public orderIndex?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}
