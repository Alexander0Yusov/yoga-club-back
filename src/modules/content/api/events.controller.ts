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
import { CreateEventCommand } from 'src/modules/content/application/usecases/events/create-event.usecase';
import { UpdateEventCommand } from 'src/modules/content/application/usecases/events/update-event.usecase';
import { DeleteEventCommand } from 'src/modules/content/application/usecases/events/delete-event.usecase';
import { CreateEventDto, UpdateEventDto } from 'src/modules/content/api/dto/events.dto';
import { ParseJsonPipe } from 'src/modules/content/api/pipes/parse-json.pipe';
import { JwtAuthGuard } from 'src/modules/user-accounts/guards/bearer/jwt-auth.guard';
import { APIErrorResult } from 'src/core/dto/error-result.dto';

const MULTER_CONFIG = {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
};

@ApiTags('Admin: Content')
@Controller('events')
export class EventsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new event (Admin only)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'cover', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
  ], MULTER_CONFIG))
  async create(
    @Body(new ParseJsonPipe(['title', 'content', 'seoMetadata', 'isActive'])) payload: CreateEventDto,
    @UploadedFiles() files: { cover?: Express.Multer.File[]; gallery?: Express.Multer.File[] },
  ): Promise<string> {
    return this.commandBus.execute(new CreateEventCommand(
      payload,
      files.cover?.[0],
      files.gallery || [],
    ));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing event (Admin only)' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'cover', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
  ], MULTER_CONFIG))
  async update(
    @Param('id') id: string,
    @Body(new ParseJsonPipe(['title', 'content', 'seoMetadata', 'cover', 'gallery', 'isActive'])) payload: UpdateEventDto,
    @UploadedFiles() files: { cover?: Express.Multer.File[]; gallery?: Express.Multer.File[] },
  ): Promise<void> {
    await this.commandBus.execute(new UpdateEventCommand(
      id,
      payload,
      files.cover?.[0],
      files.gallery || [],
    ));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete an event and remove images from cloud (Admin only)' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteEventCommand(id));
  }
}
