import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard response DTO for localized text objects.
 * Used to define the structure of translated content in API responses.
 */
export class LocalizedTextResponseDto {
  @ApiProperty({ example: 'Текст на русском', description: 'Russian translation', required: true })
  ru: string;

  @ApiProperty({ example: 'English text', description: 'English translation', required: false })
  en?: string;

  @ApiProperty({ example: 'Deutscher Text', description: 'German translation', required: false })
  de?: string;

  @ApiProperty({ example: 'Текст українською', description: 'Ukrainian translation', required: false })
  uk?: string;
}
