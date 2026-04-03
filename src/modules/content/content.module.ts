import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { AboutMeCard, AboutMeCardSchema } from './domain/about-me-card.entity';
import { ClubEvent, ClubEventSchema } from './domain/club-event.entity';
import { MetaSettings, MetaSettingsSchema } from './domain/meta-settings.entity';
import { Section, SectionSchema } from './domain/section.entity';
import { PracticeBenefit, PracticeBenefitSchema } from './domain/practice-benefit.entity';
import { DemoVideoCard, DemoVideoCardSchema } from './domain/demo-video-card.entity';
import { Review, ReviewSchema } from './domain/review.entity';
import { YogaDirection, YogaDirectionSchema } from './domain/yoga-direction.entity';
import { HeroIntro, HeroIntroSchema } from './domain/hero-intro.entity';
import { Advantage, AdvantageSchema } from './domain/advantage.entity';
import { EventRefsPanel, EventRefsPanelSchema } from './domain/event-refs-panel.entity';
import { AboutMeCardRepository } from './infrastructure/about-me-card.repository';
import { EventsRepository } from './infrastructure/events.repository';
import { MetaSettingsRepository } from './infrastructure/meta-settings.repository';
import { MetaSettingsSeeder } from './infrastructure/meta-settings.seeder';
import { SectionsRepository } from './infrastructure/sections.repository';
import { PracticeBenefitRepository } from './infrastructure/practice-benefit.repository';
import { DemoVideoCardRepository } from './infrastructure/demo-video-card.repository';
import { ReviewRepository } from './infrastructure/review.repository';
import { YogaDirectionRepository } from './infrastructure/yoga-direction.repository';
import { HeroIntroRepository } from './infrastructure/hero-intro.repository';
import { AdvantageRepository } from './infrastructure/advantage.repository';
import { EventRefsPanelRepository } from './infrastructure/event-refs-panel.repository';
import { AboutMeCardController } from './api/about-me-card.controller';
import { CreateAboutMeCardUseCase } from './application/usecases/about-me-card/create-about-me-card.usecase';
import { UpdateAboutMeCardUseCase } from './application/usecases/about-me-card/update-about-me-card.usecase';
import { EventsController } from './api/events.controller';
import { CreateEventUseCase } from './application/usecases/events/create-event.usecase';
import { UpdateEventUseCase } from './application/usecases/events/update-event.usecase';
import { DeleteEventUseCase } from './application/usecases/events/delete-event.usecase';
import { DeleteAboutMeCardUseCase } from './application/usecases/about-me-card/delete-about-me-card.usecase';
import { CreateEventRefsPanelUseCase } from './application/usecases/event-refs-panel/create-event-refs-panel.usecase';
import { UpdateEventRefsPanelUseCase } from './application/usecases/event-refs-panel/update-event-refs-panel.usecase';
import { DeleteEventRefsPanelUseCase } from './application/usecases/event-refs-panel/delete-event-refs-panel.usecase';
import { HeroIntroController } from './api/hero-intro.controller';
import { CreateHeroIntroUseCase } from './application/usecases/hero-intro/create-hero-intro.usecase';
import { UpdateHeroIntroUseCase } from './application/usecases/hero-intro/update-hero-intro.usecase';
import { DeleteHeroIntroUseCase } from './application/usecases/hero-intro/delete-hero-intro.usecase';
import { PracticeBenefitController } from './api/practice-benefit.controller';
import { CreatePracticeBenefitUseCase } from './application/usecases/practice-benefit/create-practice-benefit.usecase';
import { UpdatePracticeBenefitUseCase } from './application/usecases/practice-benefit/update-practice-benefit.usecase';
import { DeletePracticeBenefitUseCase } from './application/usecases/practice-benefit/delete-practice-benefit.usecase';
import { AdvantageController } from './api/advantage.controller';
import { CreateAdvantageUseCase } from './application/usecases/advantage/create-advantage.usecase';
import { UpdateAdvantageUseCase } from './application/usecases/advantage/update-advantage.usecase';
import { DeleteAdvantageUseCase } from './application/usecases/advantage/delete-advantage.usecase';
import { YogaDirectionController } from './api/yoga-direction.controller';
import { CreateYogaDirectionUseCase } from './application/usecases/yoga-direction/create-yoga-direction.usecase';
import { UpdateYogaDirectionUseCase } from './application/usecases/yoga-direction/update-yoga-direction.usecase';
import { DeleteYogaDirectionUseCase } from './application/usecases/yoga-direction/delete-yoga-direction.usecase';
import { DemoVideoCardController } from './api/demo-video-card.controller';
import { CreateDemoVideoCardUseCase } from './application/usecases/demo-video-card/create-demo-video-card.usecase';
import { UpdateDemoVideoCardUseCase } from './application/usecases/demo-video-card/update-demo-video-card.usecase';
import { DeleteDemoVideoCardUseCase } from './application/usecases/demo-video-card/delete-demo-video-card.usecase';
import { ReviewController } from './api/review.controller';
import { CreateReviewUseCase } from './application/usecases/review/create-review.usecase';
import { UpdateReviewUseCase } from './application/usecases/review/update-review.usecase';
import { DeleteReviewUseCase } from './application/usecases/review/delete-review.usecase';
import { SectionController } from './api/section.controller';
import { EventRefsPanelController } from './api/event-refs-panel.controller';
import { PublicPagesController } from './api/public-pages.controller';
import { CreateSectionUseCase } from './application/usecases/sections/create-section.usecase';
import { UpdateSectionUseCase } from './application/usecases/sections/update-section.usecase';
import { DeleteSectionUseCase } from './application/usecases/sections/delete-section.usecase';
import { GetHomePageQueryHandler } from './application/queries/get-home-page.query';
import { ITranslationService, DeepLTranslationService } from './infrastructure/translation.service';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AboutMeCard.name, schema: AboutMeCardSchema },
      { name: ClubEvent.name, schema: ClubEventSchema },
      { name: MetaSettings.name, schema: MetaSettingsSchema },
      { name: Section.name, schema: SectionSchema },
      { name: PracticeBenefit.name, schema: PracticeBenefitSchema },
      { name: DemoVideoCard.name, schema: DemoVideoCardSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: YogaDirection.name, schema: YogaDirectionSchema },
      { name: HeroIntro.name, schema: HeroIntroSchema },
      { name: Advantage.name, schema: AdvantageSchema },
      { name: EventRefsPanel.name, schema: EventRefsPanelSchema },
    ]),
    CqrsModule,
    MediaModule,
  ],
  controllers: [
    EventsController,
    AboutMeCardController,
    HeroIntroController,
    PracticeBenefitController,
    AdvantageController,
    YogaDirectionController,
    DemoVideoCardController,
    ReviewController,
    SectionController,
    PublicPagesController,
    EventRefsPanelController,
  ],
  providers: [
    AboutMeCardRepository,
    EventsRepository,
    MetaSettingsRepository,
    MetaSettingsSeeder,
    SectionsRepository,
    PracticeBenefitRepository,
    DemoVideoCardRepository,
    ReviewRepository,
    YogaDirectionRepository,
    HeroIntroRepository,
    AdvantageRepository,
    CreateEventUseCase,
    UpdateEventUseCase,
    CreateAboutMeCardUseCase,
    UpdateAboutMeCardUseCase,
    DeleteEventUseCase,
    DeleteAboutMeCardUseCase,
    CreateHeroIntroUseCase,
    UpdateHeroIntroUseCase,
    DeleteHeroIntroUseCase,
    CreatePracticeBenefitUseCase,
    UpdatePracticeBenefitUseCase,
    DeletePracticeBenefitUseCase,
    CreateAdvantageUseCase,
    UpdateAdvantageUseCase,
    DeleteAdvantageUseCase,
    CreateYogaDirectionUseCase,
    UpdateYogaDirectionUseCase,
    DeleteYogaDirectionUseCase,
    CreateDemoVideoCardUseCase,
    UpdateDemoVideoCardUseCase,
    DeleteDemoVideoCardUseCase,
    CreateReviewUseCase,
    UpdateReviewUseCase,
    DeleteReviewUseCase,
    CreateSectionUseCase,
    UpdateSectionUseCase,
    DeleteSectionUseCase,
    CreateEventRefsPanelUseCase,
    UpdateEventRefsPanelUseCase,
    DeleteEventRefsPanelUseCase,
    EventRefsPanelRepository,
    GetHomePageQueryHandler,
    {
      provide: ITranslationService,
      useClass: DeepLTranslationService,
    },
  ],
  exports: [
    MongooseModule,
    AboutMeCardRepository,
    EventsRepository,
    MetaSettingsRepository,
    SectionsRepository,
    PracticeBenefitRepository,
    DemoVideoCardRepository,
    ReviewRepository,
    YogaDirectionRepository,
    HeroIntroRepository,
    AdvantageRepository,
    CreateEventUseCase,
    UpdateEventUseCase,
    CreateAboutMeCardUseCase,
    UpdateAboutMeCardUseCase,
    DeleteEventUseCase,
    DeleteAboutMeCardUseCase,
    CreateHeroIntroUseCase,
    UpdateHeroIntroUseCase,
    DeleteHeroIntroUseCase,
    CreatePracticeBenefitUseCase,
    UpdatePracticeBenefitUseCase,
    DeletePracticeBenefitUseCase,
    CreateAdvantageUseCase,
    UpdateAdvantageUseCase,
    DeleteAdvantageUseCase,
    CreateYogaDirectionUseCase,
    UpdateYogaDirectionUseCase,
    DeleteYogaDirectionUseCase,
    CreateDemoVideoCardUseCase,
    UpdateDemoVideoCardUseCase,
    DeleteDemoVideoCardUseCase,
    CreateReviewUseCase,
    UpdateReviewUseCase,
    DeleteReviewUseCase,
    CreateSectionUseCase,
    UpdateSectionUseCase,
    DeleteSectionUseCase,
    EventRefsPanelRepository,
    CreateEventRefsPanelUseCase,
    UpdateEventRefsPanelUseCase,
    DeleteEventRefsPanelUseCase,
  ],
})
export class ContentModule {}
