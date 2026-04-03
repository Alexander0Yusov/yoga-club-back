import { IsOptional, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LocalizedText } from '../../domain/localized-text.vo';
import { CarouselImageDto } from './carousel-image.dto';

export class CreateAdvantageDto {
  @ApiProperty({ type: () => LocalizedText })
  @ValidateNested()
  @Type(() => LocalizedText)
  public title: LocalizedText;

  @ApiProperty({ type: () => LocalizedText })
  @ValidateNested()
  @Type(() => LocalizedText)
  public text: LocalizedText;

  @ApiProperty({ example: 0, required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  public orderIndex?: number | null;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}

export class UpdateAdvantageDto {
  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public title?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text?: LocalizedText;

  @ApiProperty({ example: 0, required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  public orderIndex?: number | null;

  @ApiProperty({ type: () => CarouselImageDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CarouselImageDto)
  public image?: CarouselImageDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}
