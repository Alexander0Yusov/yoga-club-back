import { IsOptional, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CarouselImageDto } from './carousel-image.dto';

export class CreateEventRefsPanelDto {
  @ApiProperty({ type: () => CarouselImageDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CarouselImageDto)
  public leftRefImage?: CarouselImageDto;

  @ApiProperty({ type: () => CarouselImageDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CarouselImageDto)
  public rightRefImage?: CarouselImageDto;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}

export class UpdateEventRefsPanelDto {
  @ApiProperty({ type: () => CarouselImageDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CarouselImageDto)
  public leftRefImage?: CarouselImageDto;

  @ApiProperty({ type: () => CarouselImageDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CarouselImageDto)
  public rightRefImage?: CarouselImageDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  public isActive?: boolean;
}
