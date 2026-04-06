import { IsOptional, ValidateNested, IsString, IsNotEmpty, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LocalizedText } from 'src/modules/content/domain/localized-text.vo';

export class CarouselImageDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v123/yoga/sample.jpg' })
  @IsOptional()
  @IsString()
  public url: string;

  @ApiProperty({ type: () => LocalizedText, required: false })
  @IsOptional()
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public alt?: LocalizedText;

  @ApiProperty({ example: 'yoga/sample', required: false })
  @IsOptional()
  @IsString()
  public publicId?: string;
}
