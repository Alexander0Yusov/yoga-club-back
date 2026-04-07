import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth, ApiResponse, ApiOkResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { CreateHeroIntroCommand } from '../application/usecases/hero-intro/create-hero-intro.usecase';
import { UpdateHeroIntroCommand } from '../application/usecases/hero-intro/update-hero-intro.usecase';
import { DeleteHeroIntroCommand } from '../application/usecases/hero-intro/delete-hero-intro.usecase';
import { CreateHeroIntroDto, UpdateHeroIntroDto } from './dto/hero-intro.dto';
import { HeroIntroViewModel } from './view-models/hero-intro.view-model';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { HeroIntroRepository } from '../infrastructure/hero-intro.repository';
import { APIErrorResult } from 'src/core/dto/error-result.dto';
import { SkipLocalization } from 'src/core/decorators/skip-localization.decorator';

const MULTER_CONFIG = {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
};

@ApiTags('Admin: Content')
@Controller('hero-intro')
export class HeroIntroController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly repository: HeroIntroRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active hero intros' })
  @ApiQuery({ name: 'lang', required: false, enum: ['ru', 'en', 'de', 'uk'], description: 'Requested language (optional, works via cookie/header too)' })
  @ApiHeader({ name: 'Accept-Language', required: false, description: 'Standard HTTP language header' })
  @ApiOkResponse({ type: [HeroIntroViewModel], description: 'Returns automatically localized hero sections' })
  async findAll(): Promise<HeroIntroViewModel[]> {
    const items = await this.repository.findAll();

    return items.map(item => ({
      id: item._id.toString(),
      title: item.title,
      text1: item.text1,
      text2: item.text2,
      isActive: item.isActive,
      orderIndex: item.orderIndex,
      image: item.image ? {
        url: item.image.url,
        alt: item.image.alt,
      } : undefined,
    })) as any;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @SkipLocalization()
  @ApiOperation({ summary: 'Get raw HeroIntro data for Admin editing' })
  @ApiResponse({ status: 200, type: HeroIntroViewModel, description: 'Raw entity with all translations' })
  async findOne(@Param('id') id: string): Promise<HeroIntroViewModel> {
    const item = await this.repository.getByIdOrNotFoundFail(id);
    return {
      id: item._id.toString(),
      title: item.title,
      text1: item.text1,
      text2: item.text2,
      isActive: item.isActive,
      orderIndex: item.orderIndex,
      image: item.image ? {
        url: item.image.url,
        alt: item.image.alt,
      } : undefined,
    } as any;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new hero intro (Admin only)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
  ], MULTER_CONFIG))
  async create(
    @Body() payload: CreateHeroIntroDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
    @Req() request: Request,
  ): Promise<string> {
    console.log('[1. CONTROLLER RAW BODY]:', request.body);
    return this.commandBus.execute(new CreateHeroIntroCommand(
      payload,
      files?.image?.[0],
    ));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing hero intro (Admin only)' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @ApiResponse({ status: 404, description: 'Hero intro not found' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
  ], MULTER_CONFIG))
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateHeroIntroDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
    @Req() request: Request,
  ): Promise<void> {
    console.log('[1. CONTROLLER RAW BODY]:', request.body);
    await this.commandBus.execute(new UpdateHeroIntroCommand(
      id,
      payload,
      files?.image?.[0],
    ));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a hero intro and remove image from cloud (Admin only)' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Hero intro not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteHeroIntroCommand(id));
  }
}
