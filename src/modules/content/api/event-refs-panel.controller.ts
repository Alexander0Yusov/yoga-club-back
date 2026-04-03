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
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ParseJsonPipe } from './pipes/parse-json.pipe';
import { CreateEventRefsPanelCommand } from '../application/usecases/event-refs-panel/create-event-refs-panel.usecase';
import { UpdateEventRefsPanelCommand } from '../application/usecases/event-refs-panel/update-event-refs-panel.usecase';
import { DeleteEventRefsPanelCommand } from '../application/usecases/event-refs-panel/delete-event-refs-panel.usecase';
import { CreateEventRefsPanelDto, UpdateEventRefsPanelDto } from './dto/event-refs-panel.dto';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { EventRefsPanelRepository } from '../infrastructure/event-refs-panel.repository';
import { APIErrorResult } from 'src/core/dto/error-result.dto';

@ApiTags('Admin: Content')
@Controller('event-refs-panel')
export class EventRefsPanelController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly repository: EventRefsPanelRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get active event refs panel' })
  async findOne() {
    const all = await this.repository.findAll();
    return all.length > 0 ? all[0] : null;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create event refs panel (Admin only)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'leftRefImage', maxCount: 1 },
    { name: 'rightRefImage', maxCount: 1 },
  ]))
  async create(
    @Body(new ParseJsonPipe(['payload'])) body: { payload: CreateEventRefsPanelDto },
    @UploadedFiles() files: {
      leftRefImage?: Express.Multer.File[];
      rightRefImage?: Express.Multer.File[];
    },
  ): Promise<string> {
    return this.commandBus.execute(new CreateEventRefsPanelCommand(body.payload, {
      leftRefImage: files.leftRefImage?.[0],
      rightRefImage: files.rightRefImage?.[0],
    }));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update event refs panel (Admin only)' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @ApiResponse({ status: 404, description: 'Panel not found' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'leftRefImage', maxCount: 1 },
    { name: 'rightRefImage', maxCount: 1 },
  ]))
  async update(
    @Param('id') id: string,
    @Body(new ParseJsonPipe(['payload'])) body: { payload: UpdateEventRefsPanelDto },
    @UploadedFiles() files: {
      leftRefImage?: Express.Multer.File[];
      rightRefImage?: Express.Multer.File[];
    },
  ): Promise<void> {
    await this.commandBus.execute(new UpdateEventRefsPanelCommand(id, body.payload, {
      leftRefImage: files.leftRefImage?.[0],
      rightRefImage: files.rightRefImage?.[0],
    }));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete event refs panel (Admin only)' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Panel not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteEventRefsPanelCommand(id));
  }
}
