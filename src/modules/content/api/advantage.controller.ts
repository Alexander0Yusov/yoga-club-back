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
import { CreateAdvantageCommand } from '../application/usecases/advantage/create-advantage.usecase';
import { UpdateAdvantageCommand } from '../application/usecases/advantage/update-advantage.usecase';
import { DeleteAdvantageCommand } from '../application/usecases/advantage/delete-advantage.usecase';
import { CreateAdvantageDto, UpdateAdvantageDto } from './dto/advantage.dto';
import { ParseJsonPipe } from './pipes/parse-json.pipe';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { AdvantageRepository } from '../infrastructure/advantage.repository';
import { APIErrorResult } from 'src/core/dto/error-result.dto';

const MULTER_CONFIG = {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
};

@ApiTags('Admin: Content')
@Controller('advantages')
export class AdvantageController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly repository: AdvantageRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active advantages' })
  async findAll() {
    return this.repository.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new advantage (Admin only)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
  ], MULTER_CONFIG))
  async create(
    @Body(new ParseJsonPipe(['title', 'text', 'isActive'])) payload: CreateAdvantageDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ): Promise<string> {
    return this.commandBus.execute(new CreateAdvantageCommand(
      payload,
      files.image?.[0],
    ));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing advantage (Admin only)' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @ApiResponse({ status: 404, description: 'Advantage not found' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
  ], MULTER_CONFIG))
  async update(
    @Param('id') id: string,
    @Body(new ParseJsonPipe(['title', 'text', 'image', 'isActive'])) payload: UpdateAdvantageDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ): Promise<void> {
    await this.commandBus.execute(new UpdateAdvantageCommand(
      id,
      payload,
      files.image?.[0],
    ));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete an advantage and remove image from cloud (Admin only)' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Advantage not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteAdvantageCommand(id));
  }
}
