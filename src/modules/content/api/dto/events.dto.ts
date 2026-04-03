import { IsString, IsNotEmpty, IsDateString, IsOptional, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LocalizedText } from 'src/modules/content/domain/localized-text.vo';
import { SeoMetadata } from 'src/core/base-domain-entity/seo-metadata.vo';

export class CreateEventDto {
  @ApiProperty({ example: 'yoga-retreat-2024' })
  @IsString()
  @IsNotEmpty()
  public slug: string;

  @ApiProperty({ type: () => LocalizedText })
  @ValidateNested()
  @Type(() => LocalizedText)
  public title: LocalizedText;

  @ApiProperty({ type: () => LocalizedText })
  @ValidateNested()
  @Type(() => LocalizedText)
  public content: LocalizedText;

  @ApiProperty({ type: () => SeoMetadata })
  @ValidateNested()
  @Type(() => SeoMetadata)
  public seoMetadata: SeoMetadata;

  @ApiProperty({ example: '2024-06-01T10:00:00Z' })
  @IsDateString()
  @Type(() => Date)
  public startDate: Date;

  @ApiProperty({ example: '2024-06-07T18:00:00Z' })
  @IsDateString()
  @Type(() => Date)
  public endDate: Date;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  public orderIndex?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}

import { CarouselImageDto } from './carousel-image.dto';

export class UpdateEventDto extends CreateEventDto {
  @ApiProperty({ type: () => CarouselImageDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CarouselImageDto)
  public cover?: CarouselImageDto;

  @ApiProperty({ type: () => [CarouselImageDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CarouselImageDto)
  public gallery?: CarouselImageDto[];
}
