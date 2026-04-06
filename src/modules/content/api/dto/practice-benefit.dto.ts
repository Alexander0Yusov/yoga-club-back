import { IsOptional, ValidateNested, IsBoolean, IsObject, IsNotEmptyObject } from 'class-validator';
import { Type, Transform, plainToInstance, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LocalizedText } from '../../domain/localized-text.vo';
import { CarouselImageDto } from './carousel-image.dto';

const LOCALIZED_TEXT_EXAMPLE = { en: 'Benefit description', ru: 'Описание преимущества' };
const CAROUSEL_IMAGE_EXAMPLE = { 
  url: 'https://cloudinary.com/example.jpg', 
  alt: { en: 'Benefit image', ru: 'Изображение преимущества' } 
};

/**
 * Response DTO for PracticeBenefits.
 */
export class PracticeBenefitDto {
  @ApiProperty({ example: '65bb67ac42ad03d28512e', description: 'Unique benefit ID' })
  @Expose()
  public id: string;

  @ApiProperty({ type: () => LocalizedText, example: LOCALIZED_TEXT_EXAMPLE })
  @Expose()
  public text_1: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @Expose()
  public text_2?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @Expose()
  public text_3?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @Expose()
  public text_4?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @Expose()
  public text_5?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @Expose()
  public text_6?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @Expose()
  public text_7?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @Expose()
  public text_8?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @Expose()
  public text_9?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @Expose()
  public text_10?: LocalizedText;

  @ApiProperty({ type: () => CarouselImageDto, required: false, example: CAROUSEL_IMAGE_EXAMPLE })
  @Expose()
  public image?: CarouselImageDto;

  @ApiProperty({ default: true })
  @Expose()
  public isActive: boolean;
}

const localizedTextTransform = ({ value }) => {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
  if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) return null;
  return plainToInstance(LocalizedText, parsed);
};

const carouselImageTransform = ({ value }) => {
  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
  if (parsed && typeof parsed === 'object' && Object.keys(parsed).length === 0) return null;
  return plainToInstance(CarouselImageDto, parsed);
};

export class CreatePracticeBenefitDto {
  @ApiProperty({ type: () => LocalizedText, example: LOCALIZED_TEXT_EXAMPLE })
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  public text_1: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_2?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_3?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_4?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_5?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_6?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_7?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_8?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_9?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_10?: LocalizedText;

  @ApiProperty({ type: () => CarouselImageDto, required: false, example: CAROUSEL_IMAGE_EXAMPLE })
  @IsOptional()
  @Transform(carouselImageTransform)
  @Type(() => CarouselImageDto)
  @IsObject()
  @ValidateNested()
  public image?: CarouselImageDto;

  @ApiProperty({ type: Boolean, required: false, default: true, example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  public isActive?: boolean;
}

export class UpdatePracticeBenefitDto {
  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  public text_1?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_2?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_3?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_4?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_5?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_6?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_7?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_8?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_9?: LocalizedText;

  @ApiProperty({ type: () => LocalizedText, required: false, example: LOCALIZED_TEXT_EXAMPLE })
  @IsOptional()
  @Transform(localizedTextTransform)
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public text_10?: LocalizedText;

  @ApiProperty({ type: () => CarouselImageDto, required: false, example: CAROUSEL_IMAGE_EXAMPLE })
  @IsOptional()
  @Transform(carouselImageTransform)
  @Type(() => CarouselImageDto)
  @IsObject()
  @ValidateNested()
  public image?: CarouselImageDto;

  @ApiProperty({ type: Boolean, required: false, example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  public isActive?: boolean;
}
