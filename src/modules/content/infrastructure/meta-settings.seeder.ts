import { Injectable, OnModuleInit } from '@nestjs/common';
import { MetaSettingsRepository } from './meta-settings.repository';

@Injectable()
export class MetaSettingsSeeder implements OnModuleInit {
  constructor(private readonly repository: MetaSettingsRepository) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const pages = [
      {
        pageKey: 'home',
        seo: {
          title: 'Yoga Club - Твой путь к гармонии',
          description: 'Лучшая йога-студия в городе. Профессиональные тренеры, уютная атмосфера и гибкий график.',
          imageUrl: 'https://yoga-club.com/og-home.jpg',
          alt: 'Интерьер йога-клуба',
        },
        totalRatingValue: 490,
        totalReviewCount: 100,
        extraData: { showPromoBanner: true },
      },
      {
        pageKey: 'gallery',
        seo: {
          title: 'Галерея событий - Yoga Club',
          description: 'Посмотрите фото и видео с наших последних ретритов и занятий.',
          imageUrl: 'https://yoga-club.com/og-gallery.jpg',
          alt: 'Фотографии с занятий йогой',
        },
      },
      {
        pageKey: 'contacts',
        seo: {
          title: 'Контакты - Yoga Club',
          description: 'Свяжитесь с нами для записи на пробное занятие или по любым вопросам.',
          imageUrl: 'https://yoga-club.com/og-contacts.jpg',
          alt: 'Карта проезда к йога-клубу',
        },
      },
    ];

    for (const page of pages) {
      const existing = await this.repository.findByPageKey(page.pageKey);
      if (!existing) {
        await this.repository.create(page.pageKey, page);
      }
    }
  }
}
