import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { SectionContentType } from '../../domain/section.entity';

export class LocalizedImage {
  @ApiProperty({ example: 'https://cloudinary.com/example.jpg', description: 'Publicly accessible URL' })
  public url: string;

  @ApiProperty({ example: 'Йога в горах', description: 'Localized alt text' })
  public alt: string;
}

export class CardBlockView {
  @ApiProperty({ example: 'Моя философия', required: false })
  public title?: string;

  @ApiProperty({ example: 'Йога - это путь к себе...', required: false })
  public text?: string;

  @ApiProperty({ type: () => LocalizedImage, required: false })
  public image?: LocalizedImage;
}

export class HeroIntroView {
  @ApiProperty({ example: 'Александр Юсов' })
  public title: string;

  @ApiProperty({ example: 'Превратите свою жизнь в практику' })
  public text1: string;

  @ApiProperty({ example: 'Сертифицированный инструктор Хатха-йоги' })
  public text2: string;

  @ApiProperty({ type: () => LocalizedImage, required: false })
  public image?: LocalizedImage;
}

export class DemoVideoView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  public id: string;

  @ApiProperty({ example: 'Демонстрация практики' })
  public title: string;

  @ApiProperty({ example: 'Краткий обзор нашей утренней разминки' })
  public description: string;

  @ApiProperty({ example: 'https://youtube.com/watch?v=...' })
  public videoUrl: string;

  @ApiProperty({ example: 'https://youtube.com/embed/...' })
  public embedUrl: string;

  @ApiProperty({ type: () => LocalizedImage })
  public thumbnail: LocalizedImage;

  @ApiProperty({ example: 'PT1M30S', description: 'ISO 8601 Duration format', required: false })
  public duration?: string;
}

export class ReviewView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  public id: string;

  @ApiProperty({ example: 'u123' })
  public authorId: string;

  @ApiProperty({ example: 'Великолепная практика!' })
  public text: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  public ratingValue: number;

  @ApiProperty({ example: 'e999', required: false })
  public eventId?: string;

  @ApiProperty({ example: 'ru' })
  public originalLanguage: string;
}

export class AdvantageView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  public id: string;

  @ApiProperty({ example: 'Опыт 10 лет' })
  public title: string;

  @ApiProperty({ example: 'Более 1000 проведенных занятий' })
  public text: string;

  @ApiProperty({ type: () => LocalizedImage, required: false })
  public image?: LocalizedImage;
}

export class PracticeBenefitView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  public id: string;

  @ApiProperty({ example: 'Гибкость и сила' })
  public text_1: string;
  @ApiProperty({ required: false }) public text_2: string;
  @ApiProperty({ required: false }) public text_3: string;
  @ApiProperty({ required: false }) public text_4: string;
  @ApiProperty({ required: false }) public text_5: string;
  @ApiProperty({ required: false }) public text_6: string;
  @ApiProperty({ required: false }) public text_7: string;
  @ApiProperty({ required: false }) public text_8: string;
  @ApiProperty({ required: false }) public text_9: string;
  @ApiProperty({ required: false }) public text_10: string;

  @ApiProperty({ type: () => LocalizedImage, required: false })
  public image?: LocalizedImage;
}

export class AboutMeCardView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  public id: string;

  @ApiProperty({ type: () => CardBlockView, required: false })
  public left?: CardBlockView;

  @ApiProperty({ type: () => CardBlockView, required: false })
  public right?: CardBlockView;
}

export class EventRefsPanelView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  public id: string;

  @ApiProperty({ type: () => LocalizedImage })
  public leftRefImage: LocalizedImage;

  @ApiProperty({ type: () => LocalizedImage })
  public rightRefImage: LocalizedImage;
}

export class YogaDirectionView {
  @ApiProperty({ example: '65bb67ac42ad03d28512e' })
  public id: string;

  @ApiProperty({ example: 'Хатха-йога' })
  public title: string;

  @ApiProperty({ example: 'Классическое направление...' })
  public text: string;

  @ApiProperty({ type: () => LocalizedImage, required: false })
  public image?: LocalizedImage;
}

export class SectionView {
  @ApiProperty({ example: 'Направления йоги' })
  public title: string;

  @ApiProperty({ example: 'Выберите подходящую практику', required: false })
  public subtitle_1?: string;

  @ApiProperty({ required: false })
  public subtitle_2?: string;

  @ApiProperty({ enum: SectionContentType })
  public for: SectionContentType;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(HeroIntroView) },
      { $ref: getSchemaPath(PracticeBenefitView) },
      { $ref: getSchemaPath(EventRefsPanelView) },
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
  public items: any;
}

export class HomePageViewModel {
  @ApiProperty({ example: 'ru', enum: ['ru', 'en', 'de', 'uk'] })
  public language: string;

  @ApiProperty({ type: () => [SectionView] })
  public sections: SectionView[];
}
