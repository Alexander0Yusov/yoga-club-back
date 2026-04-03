import { IsOptional, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LocalizedText } from '../../domain/localized-text.vo';
import { CarouselImageDto } from './carousel-image.dto';

export class CreatePracticeBenefitDto {
  @ApiProperty({ type: () => LocalizedText })
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_1: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_2?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_3?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_4?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_5?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_6?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_7?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_8?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_9?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_10?: LocalizedText;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}

export class UpdatePracticeBenefitDto {
  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_1: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_2?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_3?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_4?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_5?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_6?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_7?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_8?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_9?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocalizedText)
  public text_10?: LocalizedText;

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
