import { Controller, Get, Query, Req } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiQuery, ApiHeader, ApiResponse, ApiExtraModels } from '@nestjs/swagger';
import * as express from 'express';
import { GetHomePageQuery } from '../application/queries/get-home-page.query';
import { 
  HomePageViewModel, 
  HeroIntroView, 
  PracticeBenefitView, 
  EventRefsPanelView, 
  AboutMeCardView, 
  AdvantageView, 
  YogaDirectionView, 
  DemoVideoView, 
  ReviewView 
} from './view-models/home-page.view-model';

@ApiTags('Public Landing')
@ApiExtraModels(
  HeroIntroView, 
  PracticeBenefitView, 
  EventRefsPanelView, 
  AboutMeCardView, 
  AdvantageView, 
  YogaDirectionView, 
  DemoVideoView, 
  ReviewView
)
@Controller('pages')
export class PublicPagesController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('home')
  @ApiOperation({ summary: 'Get fully aggregated Home Page data (BFF)' })
  @ApiQuery({ name: 'lang', required: false, enum: ['ru', 'en', 'de', 'uk'], description: 'Requested language code' })
  @ApiHeader({ name: 'Accept-Language', required: false, description: 'Standard HTTP language header' })
  @ApiResponse({ status: 200, type: HomePageViewModel, description: 'Returns structured sections with nested content' })
  async getHome(
    @Query('lang') langQuery?: string,
    @Req() req?: express.Request,
  ): Promise<HomePageViewModel> {
    const supportedLanguages = ['ru', 'en', 'de', 'uk'];
    const defaultLang = 'en';

    // 1. Resolve language: Query parameter > Header > Default
    let lang = langQuery;

    if (!lang && req?.headers['accept-language']) {
      // Very basic header parser: just check for the first part
      const header = req.headers['accept-language'].split(',')[0].split('-')[0].toLowerCase();
      lang = header;
    }

    if (!lang || !supportedLanguages.includes(lang)) {
      lang = defaultLang;
    }

    return this.queryBus.execute(new GetHomePageQuery(lang));
  }
}
