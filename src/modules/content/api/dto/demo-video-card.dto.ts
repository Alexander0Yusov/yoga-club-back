import { IsOptional, ValidateNested, IsString, IsUrl, IsDateString, IsNumber, Matches, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LocalizedText } from '../../domain/localized-text.vo';
import { CarouselImageDto } from './carousel-image.dto';

export class CreateDemoVideoCardDto {
  @ApiProperty({ type: () => LocalizedText })
  @ValidateNested()
  @Type(() => LocalizedText)
  public title: LocalizedText;

  @ApiProperty({ type: () => LocalizedText })
  @ValidateNested()
  @Type(() => LocalizedText)
  public description: LocalizedText;

  @ApiProperty({ example: 'https://youtube.com/watch?v=dQw4w9WgXcQ' })
  @IsUrl()
  public videoUrl: string;

  @ApiProperty({ example: 'https://youtube.com/embed/dQw4w9WgXcQ' })
  @IsUrl()
  public embedUrl: string;

  @ApiProperty({ example: '2024-03-30T12:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  public publishedAt?: string;

  @ApiProperty({ example: 'PT1M30S', description: 'ISO 8601 Duration', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^PT(\d+H)?(\d+M)?(\d+S)?$/, {
    message: 'Duration must be in ISO 8601 format (e.g. PT1M30S)',
  })
  public duration?: string;

  @ApiProperty({ example: 0, required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  public orderIndex?: number | null;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}

export class UpdateDemoVideoCardDto {
  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public title?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public description?: LocalizedText;

  @ApiProperty({ example: 'https://youtube.com/watch?v=dQw4w9WgXcQ', required: false })
  @IsOptional()
  @IsUrl()
  public videoUrl?: string;

  @ApiProperty({ example: 'https://youtube.com/embed/dQw4w9WgXcQ', required: false })
  @IsOptional()
  @IsUrl()
  public embedUrl?: string;

  @ApiProperty({ example: '2024-03-30T12:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  public publishedAt?: string;

  @ApiProperty({ example: 'PT1M30S', description: 'ISO 8601 Duration', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^PT(\d+H)?(\d+M)?(\d+S)?$/, {
    message: 'Duration must be in ISO 8601 format (e.g. PT1M30S)',
  })
  public duration?: string;

  @ApiProperty({ example: 0, required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  public orderIndex?: number | null;

  @ApiProperty({ type: () => CarouselImageDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CarouselImageDto)
  public thumbnail?: CarouselImageDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}
