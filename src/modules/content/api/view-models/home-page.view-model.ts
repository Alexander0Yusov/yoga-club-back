import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SectionContentType } from '../../domain/section.entity';

export class LocalizedImage {
  @ApiProperty({ example: 'https://cloudinary.com/example.jpg', description: 'Publicly accessible URL' })
  @Expose()
  public url: string;

  @ApiProperty({ example: 'Йога в горах', description: 'Localized alt text' })
  @Expose()
  public alt: string;
}

export class CardBlockView {
  @ApiProperty({ example: 'Моя философия', required: false })
  @Expose()
  public title?: string;

  @ApiProperty({ example: 'Йога - это путь к себе...', required: false })
  @Expose()
  public text?: string;

  @ApiProperty({ type: () => LocalizedImage, required: false })
  @Expose()
  public image?: LocalizedImage;
}

export class HeroIntroView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  @Expose()
  public id: string;

  @ApiProperty({ example: 'Александр Юсов' })
  @Expose()
  public title: string;

  @ApiProperty({ example: 'Превратите свою жизнь в практику' })
  @Expose()
  public text1: string;

  @ApiProperty({ example: 'Сертифицированный инструктор Хатха-йоги' })
  @Expose()
  public text2: string;

  @ApiProperty({ type: () => LocalizedImage, required: false })
  @Expose()
  public image?: LocalizedImage;
}

export class DemoVideoView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  @Expose()
  public id: string;

  @ApiProperty({ example: 'Демонстрация практики' })
  @Expose()
  public title: string;

  @ApiProperty({ example: 'Краткий обзор нашей утренней разминки' })
  @Expose()
  public description: string;

  @ApiProperty({ example: 'https://youtube.com/watch?v=...' })
  @Expose()
  public videoUrl: string;

  @ApiProperty({ example: 'https://youtube.com/embed/...' })
  @Expose()
  public embedUrl: string;

  @ApiProperty({ type: () => LocalizedImage })
  @Expose()
  public thumbnail: LocalizedImage;

  @ApiProperty({ example: 'PT1M30S', description: 'ISO 8601 Duration format', required: false })
  @Expose()
  public duration?: string;
}

export class ReviewView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  @Expose()
  public id: string;

  @ApiProperty({ example: 'u123' })
  @Expose()
  public authorId: string;

  @ApiProperty({ example: 'Великолепная практика!' })
  @Expose()
  public text: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @Expose()
  public ratingValue: number;

  @ApiProperty({ example: 'e999', required: false })
  @Expose()
  public eventId?: string;

  @ApiProperty({ example: 'ru' })
  @Expose()
  public originalLanguage: string;
}

export class AdvantageView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  @Expose()
  public id: string;

  @ApiProperty({ example: 'Опыт 10 лет' })
  @Expose()
  public title: string;

  @ApiProperty({ example: 'Более 1000 проведенных занятий' })
  @Expose()
  public text: string;

  @ApiProperty({ type: () => LocalizedImage, required: false })
  @Expose()
  public image?: LocalizedImage;
}

export class PracticeBenefitView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  @Expose()
  public id: string;

  @ApiProperty({ example: 'Гибкость и сила' })
  @Expose()
  public text_1: string;

  @ApiProperty({ required: false }) @Expose() public text_2: string;
  @ApiProperty({ required: false }) @Expose() public text_3: string;
  @ApiProperty({ required: false }) @Expose() public text_4: string;
  @ApiProperty({ required: false }) @Expose() public text_5: string;
  @ApiProperty({ required: false }) @Expose() public text_6: string;
  @ApiProperty({ required: false }) @Expose() public text_7: string;
  @ApiProperty({ required: false }) @Expose() public text_8: string;
  @ApiProperty({ required: false }) @Expose() public text_9: string;
  @ApiProperty({ required: false }) @Expose() public text_10: string;

  @ApiProperty({ type: () => LocalizedImage, required: false })
  @Expose()
  public image?: LocalizedImage;
}

export class AboutMeCardView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  @Expose()
  public id: string;

  @ApiProperty({ type: () => CardBlockView, required: false })
  @Expose()
  public left?: CardBlockView;

  @ApiProperty({ type: () => CardBlockView, required: false })
  @Expose()
  public right?: CardBlockView;
}

export class EventRefsPanelView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  @Expose()
  public id: string;

  @ApiProperty({ type: () => LocalizedImage })
  @Expose()
  public leftRefImage: LocalizedImage;

  @ApiProperty({ type: () => LocalizedImage })
  @Expose()
  public rightRefImage: LocalizedImage;
}

export class YogaDirectionView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  @Expose()
  public id: string;

  @ApiProperty({ example: 'Хатха-йога' })
  @Expose()
  public title: string;

  @ApiProperty({ example: 'Классическое направление...' })
  @Expose()
  public text: string;

  @ApiProperty({ type: () => LocalizedImage, required: false })
  @Expose()
  public image?: LocalizedImage;
}

export class SectionView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e', description: 'Unique section ID' })
  @Expose()
  public id: string;

  @ApiProperty({ example: 'Направления йоги' })
  @Expose()
  public title: string;

  @ApiProperty({ example: 'Выберите подходящую практику', required: false })
  @Expose()
  public subtitle_1?: string;

  @ApiProperty({ required: false })
  @Expose()
  public subtitle_2?: string;

  @ApiProperty({ enum: SectionContentType })
  @Expose()
  public for: SectionContentType;

  @ApiProperty({
    oneOf: [
      { type: 'array', items: { $ref: getSchemaPath(HeroIntroView) } },
      { type: 'array', items: { $ref: getSchemaPath(PracticeBenefitView) } },
      { type: 'array', items: { $ref: getSchemaPath(EventRefsPanelView) } },
      { type: 'array', items: { $ref: getSchemaPath(AboutMeCardView) } },
      { type: 'array', items: { $ref: getSchemaPath(AdvantageView) } },
      { type: 'array', items: { $ref: getSchemaPath(YogaDirectionView) } },
      { type: 'array', items: { $ref: getSchemaPath(DemoVideoView) } },
      { type: 'array', items: { $ref: getSchemaPath(ReviewView) } },
      { type: 'array', items: { type: 'object' }, description: 'Empty or dynamic content' },
    ],
    description: 'Nested content mapping based on the "for" property',
    required: false,
    nullable: true,
  })
  @Expose()
  public items: any;
}

export class SeoMetadataView {
  @ApiProperty({ example: 'Yoga Club - Твой путь к гармонии', description: 'Localized SEO title' })
  @Expose()
  public title: string;

  @ApiProperty({ example: 'Лучшая йога-студия в городе...', description: 'Localized SEO description' })
  @Expose()
  public description: string;

  @ApiProperty({ example: 'https://cloudinary.com/og-home.jpg', required: false, description: 'OG Image URL' })
  @Expose()
  public imageUrl?: string;

  @ApiProperty({ example: 'Интерьер йога-клуба', required: false, description: 'Localized image alt' })
  @Expose()
  public alt?: string;
}

export class HomePageViewModel {
  @ApiProperty({ example: 'ru', enum: ['ru', 'en', 'de', 'uk'] })
  @Expose()
  public language: string;

  @ApiProperty({ type: () => SeoMetadataView, description: 'Page SEO Metadata' })
  @Expose()
  public meta: SeoMetadataView;

  @ApiProperty({ type: () => [SectionView] })
  @Expose()
  public sections: SectionView[];
}
