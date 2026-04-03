import { IsOptional, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LocalizedText } from '../../domain/localized-text.vo';
import { CarouselImageDto } from './carousel-image.dto';

export class CreateHeroIntroDto {
  @ApiProperty({ type: () => LocalizedText })
  @ValidateNested()
  @Type(() => LocalizedText)
  public title: LocalizedText;

  @ApiProperty({ type: () => LocalizedText })
  @ValidateNested()
  @Type(() => LocalizedText)
  public text1: LocalizedText;

  @ApiProperty({ type: () => LocalizedText })
  @ValidateNested()
  @Type(() => LocalizedText)
  public text2: LocalizedText;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}

export class UpdateHeroIntroDto {
  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public title?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text1?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text2?: LocalizedText;

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
