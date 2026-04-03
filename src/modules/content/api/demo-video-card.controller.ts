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
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateDemoVideoCardCommand } from '../application/usecases/demo-video-card/create-demo-video-card.usecase';
import { UpdateDemoVideoCardCommand } from '../application/usecases/demo-video-card/update-demo-video-card.usecase';
import { DeleteDemoVideoCardCommand } from '../application/usecases/demo-video-card/delete-demo-video-card.usecase';
import { CreateDemoVideoCardDto, UpdateDemoVideoCardDto } from './dto/demo-video-card.dto';
import { ParseJsonPipe } from './pipes/parse-json.pipe';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { DemoVideoCardRepository } from '../infrastructure/demo-video-card.repository';
import { APIErrorResult } from 'src/core/dto/error-result.dto';

const MULTER_CONFIG = {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
};

@ApiTags('Admin: Content')
@Controller('demo-video-cards')
export class DemoVideoCardController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly repository: DemoVideoCardRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active demo video cards' })
  async findAll() {
    return this.repository.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new demo video card (Admin only)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'thumbnail', maxCount: 1 },
  ], MULTER_CONFIG))
  async create(
    @Body(new ParseJsonPipe(['title', 'description', 'isActive'])) payload: CreateDemoVideoCardDto,
    @UploadedFiles() files: { thumbnail?: Express.Multer.File[] },
  ): Promise<string> {
    return this.commandBus.execute(new CreateDemoVideoCardCommand(
      payload,
      files.thumbnail?.[0],
    ));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing demo video card (Admin only)' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'thumbnail', maxCount: 1 },
  ], MULTER_CONFIG))
  async update(
    @Param('id') id: string,
    @Body(new ParseJsonPipe(['title', 'description', 'thumbnail', 'isActive'])) payload: UpdateDemoVideoCardDto,
    @UploadedFiles() files: { thumbnail?: Express.Multer.File[] },
  ): Promise<void> {
    await this.commandBus.execute(new UpdateDemoVideoCardCommand(
      id,
      payload,
      files.thumbnail?.[0],
    ));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a demo video card (Admin only)' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteDemoVideoCardCommand(id));
  }
}
