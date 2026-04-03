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
import { CreateYogaDirectionCommand } from '../application/usecases/yoga-direction/create-yoga-direction.usecase';
import { UpdateYogaDirectionCommand } from '../application/usecases/yoga-direction/update-yoga-direction.usecase';
import { DeleteYogaDirectionCommand } from '../application/usecases/yoga-direction/delete-yoga-direction.usecase';
import { CreateYogaDirectionDto, UpdateYogaDirectionDto } from './dto/yoga-direction.dto';
import { ParseJsonPipe } from './pipes/parse-json.pipe';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { YogaDirectionRepository } from '../infrastructure/yoga-direction.repository';
import { APIErrorResult } from 'src/core/dto/error-result.dto';

const MULTER_CONFIG = {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
};

@ApiTags('Admin: Content')
@Controller('yoga-directions')
export class YogaDirectionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly repository: YogaDirectionRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active yoga directions' })
  async findAll() {
    return this.repository.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new yoga direction (Admin only)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
  ], MULTER_CONFIG))
  async create(
    @Body(new ParseJsonPipe(['title', 'text', 'isActive'])) payload: CreateYogaDirectionDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ): Promise<string> {
    return this.commandBus.execute(new CreateYogaDirectionCommand(
      payload,
      files.image?.[0],
    ));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing yoga direction (Admin only)' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @ApiResponse({ status: 404, description: 'Direction not found' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
  ], MULTER_CONFIG))
  async update(
    @Param('id') id: string,
    @Body(new ParseJsonPipe(['title', 'text', 'image', 'isActive'])) payload: UpdateYogaDirectionDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ): Promise<void> {
    await this.commandBus.execute(new UpdateYogaDirectionCommand(
      id,
      payload,
      files.image?.[0],
    ));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a yoga direction and remove image from cloud (Admin only)' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Direction not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteYogaDirectionCommand(id));
  }
}
