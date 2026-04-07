import { ApiProperty } from '@nestjs/swagger';
import { LocalizedTextResponseDto } from './localized-text-response.dto';

export class CarouselImageView {
  @ApiProperty({ example: 'https://cloudinary.com/example.jpg', description: 'Publicly accessible URL' })
  public url: string;

  @ApiProperty({ type: () => LocalizedTextResponseDto, description: 'Localized alt text for image' })
  public alt: LocalizedTextResponseDto;
}

export class HeroIntroViewModel {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  public id: string;

  @ApiProperty({ type: () => LocalizedTextResponseDto, description: 'Localized title' })
  public title: LocalizedTextResponseDto;

  @ApiProperty({ type: () => LocalizedTextResponseDto, description: 'Localized text 1' })
  public text1: LocalizedTextResponseDto;

  @ApiProperty({ type: () => LocalizedTextResponseDto, description: 'Localized text 2' })
  public text2: LocalizedTextResponseDto;

  @ApiProperty({ type: () => CarouselImageView, required: false })
  public image?: CarouselImageView;

  @ApiProperty({ example: true })
  public isActive: boolean;

  @ApiProperty({ example: 0, required: false, nullable: true })
  public orderIndex?: number | null;
}
