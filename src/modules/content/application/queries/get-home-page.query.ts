import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SectionsRepository } from '../../infrastructure/sections.repository';
import { HeroIntroRepository } from '../../infrastructure/hero-intro.repository';
import { DemoVideoCardRepository } from '../../infrastructure/demo-video-card.repository';
import { ReviewRepository } from '../../infrastructure/review.repository';
import { AdvantageRepository } from '../../infrastructure/advantage.repository';
import { PracticeBenefitRepository } from '../../infrastructure/practice-benefit.repository';
import { AboutMeCardRepository } from '../../infrastructure/about-me-card.repository';
import { YogaDirectionRepository } from '../../infrastructure/yoga-direction.repository';
import { EventRefsPanelRepository } from '../../infrastructure/event-refs-panel.repository';
import { MetaSettingsRepository } from '../../infrastructure/meta-settings.repository';
import { SectionContentType } from '../../domain/section.entity';
import { HomePageViewModel } from '../../api/view-models/home-page.view-model';

export class GetHomePageQuery {
  constructor(public readonly lang: string) {}
}

@QueryHandler(GetHomePageQuery)
export class GetHomePageQueryHandler implements IQueryHandler<GetHomePageQuery> {
  constructor(
    private readonly sectionsRepo: SectionsRepository,
    private readonly heroRepo: HeroIntroRepository,
    private readonly videoRepo: DemoVideoCardRepository,
    private readonly reviewRepo: ReviewRepository,
    private readonly advantageRepo: AdvantageRepository,
    private readonly practiceRepo: PracticeBenefitRepository,
    private readonly aboutRepo: AboutMeCardRepository,
    private readonly yogaRepo: YogaDirectionRepository,
    private readonly eventRefsRepo: EventRefsPanelRepository,
    private readonly metaSettingsRepo: MetaSettingsRepository,
  ) {}

  async execute(query: GetHomePageQuery): Promise<HomePageViewModel> {
    const { lang } = query;

    // Concurrent fetching
    const [
      sections,
      heroIntros,
      videos,
      reviews,
      advantages,
      practiceBenefits,
      aboutCards,
      yogaDirections,
      eventRefsPanels,
      homeSettings,
    ] = await Promise.all([
      this.sectionsRepo.findActive(),
      this.heroRepo.findActive(),
      this.videoRepo.findActive(),
      this.reviewRepo.findActive(),
      this.advantageRepo.findActive(),
      this.practiceRepo.findActive(),
      this.aboutRepo.findActive(),
      this.yogaRepo.findActive(),
      this.eventRefsRepo.findActive(),
      this.metaSettingsRepo.findByPageKey('home'),
    ]);


    // Page Meta mapping
    const meta = homeSettings?.seo ? {
      title: homeSettings.seo.title,
      description: homeSettings.seo.description,
      imageUrl: homeSettings.seo.imageUrl,
      alt: homeSettings.seo.alt,
    } : {
      title: '',
      description: '',
    };

    // Data Mapping according to "Shelves" Approach
    const mappedSections = sections.map((section) => {
      let content: any = null;

      switch (section.for) {
        case SectionContentType.HERO_INTRO:
          content = heroIntros.length > 0 ? [{
            id: heroIntros[0]._id.toString(),
            title: heroIntros[0].title,
            text1: heroIntros[0].text1,
            text2: heroIntros[0].text2,
            image: heroIntros[0].image,
          }] : [];
          break;

        case SectionContentType.PRACTICE_BENEFITS:
          content = practiceBenefits.length > 0 ? [{
            id: practiceBenefits[0]._id.toString(),
            text_1: practiceBenefits[0].text_1,
            text_2: practiceBenefits[0].text_2,
            text_3: practiceBenefits[0].text_3,
            text_4: practiceBenefits[0].text_4,
            text_5: practiceBenefits[0].text_5,
            text_6: practiceBenefits[0].text_6,
            text_7: practiceBenefits[0].text_7,
            text_8: practiceBenefits[0].text_8,
            text_9: practiceBenefits[0].text_9,
            text_10: practiceBenefits[0].text_10,
            image: practiceBenefits[0].image,
          }] : [];
          break;

        case SectionContentType.ABOUT_ME_CARDS:
          content = aboutCards.map(i => ({
            id: i._id.toString(),
            left: i.left,
            right: i.right,
          }));
          break;
// ... (lines 125-179 remain similar but I must ensure I don't break the switch)
        case SectionContentType.ADVANTAGES:
          content = advantages.map(i => ({
            id: i._id.toString(),
            title: i.title,
            text: i.text,
            image: i.image,
          }));
          break;

        case SectionContentType.YOGA_DIRECTIONS:
          content = yogaDirections.map(i => ({
            id: i._id.toString(),
            title: i.title,
            text: i.text,
            image: i.image,
          }));
          break;

        case SectionContentType.VIDEOS:
          content = videos.map(i => ({
            id: i._id.toString(),
            title: i.title,
            description: i.description,
            videoUrl: i.videoUrl,
            embedUrl: i.embedUrl,
            thumbnail: i.thumbnail,
            duration: i.duration,
          }));
          break;

        case SectionContentType.REVIEWS:
          content = reviews.map(i => ({
            id: i._id.toString(),
            authorId: i.authorId,
            text: i.text,
            ratingValue: i.ratingValue,
            eventId: i.eventId,
            originalLanguage: i.originalLanguage,
          }));
          break;

        case SectionContentType.EVENT_REFS_PANEL:
          content = eventRefsPanels.length > 0 ? [{
            id: eventRefsPanels[0]._id.toString(),
            leftRefImage: eventRefsPanels[0].leftRefImage,
            rightRefImage: eventRefsPanels[0].rightRefImage,
          }] : [];
          break;

        case SectionContentType.BOOKINGS:
        case SectionContentType.CLUB_EVENTS:
          content = []; // Section wrapper only
          break;
      }

      return {
        id: section._id.toString(),
        title: section.title,
        subtitle_1: section.subtitle_1,
        subtitle_2: section.subtitle_2,
        for: section.for,
        items: content,
      };
    });

    return {
      language: lang,
      meta,
      sections: mappedSections,
    } as any;
  }
}
