import { IsNumber, IsOptional, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LocalizedText } from 'src/modules/content/domain/localized-text.vo';
import { CarouselImageDto } from './carousel-image.dto';

export class CardBlockDto {
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

  @ApiProperty({ type: () => CarouselImageDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CarouselImageDto)
  public image?: CarouselImageDto;
}

export class CreateAboutMeCardDto {
  @ApiProperty({ type: () => CardBlockDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CardBlockDto)
  public left?: CardBlockDto;

  @ApiProperty({ type: () => CardBlockDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CardBlockDto)
  public right?: CardBlockDto;

  @ApiProperty({ example: 0, required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  public orderIndex?: number | null;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}

export class UpdateAboutMeCardDto extends CreateAboutMeCardDto {}
