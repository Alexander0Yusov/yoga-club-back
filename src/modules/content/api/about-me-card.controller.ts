import {
  Controller,
  Post,
  Put,
  Delete,
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
import { CreateAboutMeCardCommand } from '../application/usecases/about-me-card/create-about-me-card.usecase';
import { UpdateAboutMeCardCommand } from '../application/usecases/about-me-card/update-about-me-card.usecase';
import { DeleteAboutMeCardCommand } from '../application/usecases/about-me-card/delete-about-me-card.usecase';
import { CreateAboutMeCardDto, UpdateAboutMeCardDto } from './dto/about-me-card.dto';
import { ParseJsonPipe } from './pipes/parse-json.pipe';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { APIErrorResult } from 'src/core/dto/error-result.dto';

const MULTER_CONFIG = {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
};

@ApiTags('Admin: Content')
@Controller('about-me')
export class AboutMeCardController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new About Me card (Admin only)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'leftImage', maxCount: 1 },
    { name: 'rightImage', maxCount: 1 },
  ], MULTER_CONFIG))
  async create(
    @Body(new ParseJsonPipe(['left', 'right', 'isActive'])) payload: CreateAboutMeCardDto,
    @UploadedFiles() files: { leftImage?: Express.Multer.File[]; rightImage?: Express.Multer.File[] },
  ): Promise<string> {
    return this.commandBus.execute(new CreateAboutMeCardCommand(
      payload,
      files.leftImage?.[0],
      files.rightImage?.[0],
    ));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing About Me card (Admin only)' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @ApiResponse({ status: 404, description: 'About Me card not found' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'leftImage', maxCount: 1 },
    { name: 'rightImage', maxCount: 1 },
  ], MULTER_CONFIG))
  async update(
    @Param('id') id: string,
    @Body(new ParseJsonPipe(['left', 'right', 'isActive'])) payload: UpdateAboutMeCardDto,
    @UploadedFiles() files: { leftImage?: Express.Multer.File[]; rightImage?: Express.Multer.File[] },
  ): Promise<void> {
    await this.commandBus.execute(new UpdateAboutMeCardCommand(
      id,
      payload,
      files.leftImage?.[0],
      files.rightImage?.[0],
    ));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete an About Me card and remove images from cloud (Admin only)' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'About Me card not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteAboutMeCardCommand(id));
  }
}
