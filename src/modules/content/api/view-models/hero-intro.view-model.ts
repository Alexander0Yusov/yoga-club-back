import { ApiProperty } from '@nestjs/swagger';

export class CarouselImageView {
  @ApiProperty({ example: 'https://cloudinary.com/example.jpg', description: 'Publicly accessible URL' })
  public url: string;

  @ApiProperty({ example: 'Йога в горах', description: 'Localized alt text' })
  public alt: string;
}

export class HeroIntroViewModel {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  public id: string;

  @ApiProperty({ example: 'Yoga Club', description: 'Localized title' })
  public title: string;

  @ApiProperty({ example: 'Твой путь к гармонии', description: 'Localized text 1' })
  public text1: string;

  @ApiProperty({ example: 'Лучшая йога-студия в городе', description: 'Localized text 2' })
  public text2: string;

  @ApiProperty({ type: () => CarouselImageView, required: false })
  public image?: CarouselImageView;

  @ApiProperty({ example: true })
  public isActive: boolean;

  @ApiProperty({ example: 0, required: false, nullable: true })
  public orderIndex?: number | null;
}
