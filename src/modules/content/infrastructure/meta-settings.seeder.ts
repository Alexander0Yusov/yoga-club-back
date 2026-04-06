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
          title: { ru: 'Yoga Club - Твой путь к гармонии' },
          description: { ru: 'Лучшая йога-студия в городе. Профессиональные тренеры, уютная атмосфера и гибкий график.' },
          imageUrl: 'https://yoga-club.com/og-home.jpg',
          alt: { ru: 'Интерьер йога-клуба' },
        },
        totalRatingValue: 490,
        totalReviewCount: 100,
        extraData: { showPromoBanner: true },
      },
      {
        pageKey: 'gallery',
        seo: {
          title: { ru: 'Галерея событий - Yoga Club' },
          description: { ru: 'Посмотрите фото и видео с наших последних ретритов и занятий.' },
          imageUrl: 'https://yoga-club.com/og-gallery.jpg',
          alt: { ru: 'Фотографии с занятий йогой' },
        },
      },
      {
        pageKey: 'contacts',
        seo: {
          title: { ru: 'Контакты - Yoga Club' },
          description: { ru: 'Свяжитесь с нами для записи на пробное занятие или по любым вопросам.' },
          imageUrl: 'https://yoga-club.com/og-contacts.jpg',
          alt: { ru: 'Карта проезда к йога-клубу' },
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
