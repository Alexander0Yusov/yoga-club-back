import { IsOptional, ValidateNested, IsString, IsObject } from 'class-validator';
import { Type, Transform, plainToInstance } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { LocalizedText } from 'src/modules/content/domain/localized-text.vo';

export class CarouselImageDto {
  @ApiProperty({ example: 'https://res.cloudinary.com/demo/image/upload/v123/yoga/sample.jpg' })
  @IsOptional()
  @IsString()
  public url: string;

  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Alt text: plain string (→ saved as ru) or JSON {"ru":"..","en":".."}',
    example: 'Йога в горах',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    // Already a LocalizedText object — pass through
    if (typeof value === 'object' && !Array.isArray(value)) {
      return plainToInstance(LocalizedText, value);
    }
    // JSON string → try to parse
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          return plainToInstance(LocalizedText, parsed);
        }
      } catch {
        // Plain string (e.g. "Йога в горах") → wrap as Russian locale
        return plainToInstance(LocalizedText, { ru: value });
      }
    }
    return undefined;
  })
  @Type(() => LocalizedText)
  @IsObject()
  @ValidateNested()
  public alt?: LocalizedText;

  @ApiProperty({ example: 'yoga/sample', required: false })
  @IsOptional()
  @IsString()
  public publicId?: string;
}
