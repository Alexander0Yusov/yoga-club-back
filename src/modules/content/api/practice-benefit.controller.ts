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
import { CreatePracticeBenefitCommand } from '../application/usecases/practice-benefit/create-practice-benefit.usecase';
import { UpdatePracticeBenefitCommand } from '../application/usecases/practice-benefit/update-practice-benefit.usecase';
import { DeletePracticeBenefitCommand } from '../application/usecases/practice-benefit/delete-practice-benefit.usecase';
import { CreatePracticeBenefitDto, UpdatePracticeBenefitDto } from './dto/practice-benefit.dto';
import { ParseJsonPipe } from './pipes/parse-json.pipe';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { PracticeBenefitRepository } from '../infrastructure/practice-benefit.repository';
import { APIErrorResult } from 'src/core/dto/error-result.dto';

const MULTER_CONFIG = {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
};

const TEXT_FIELDS = Array.from({ length: 10 }, (_, i) => `text_${i + 1}`);

@ApiTags('Admin: Content')
@Controller('practice-benefits')
export class PracticeBenefitController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly repository: PracticeBenefitRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active practice benefits' })
  async findAll() {
    return this.repository.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new practice benefit (Admin only)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
  ], MULTER_CONFIG))
  async create(
    @Body(new ParseJsonPipe([...TEXT_FIELDS, 'isActive'])) payload: CreatePracticeBenefitDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ): Promise<string> {
    return this.commandBus.execute(new CreatePracticeBenefitCommand(
      payload,
      files.image?.[0],
    ));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update an existing practice benefit (Admin only)' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @ApiResponse({ status: 404, description: 'Practice benefit not found' })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
  ], MULTER_CONFIG))
  async update(
    @Param('id') id: string,
    @Body(new ParseJsonPipe([...TEXT_FIELDS, 'image', 'isActive'])) payload: UpdatePracticeBenefitDto,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ): Promise<void> {
    await this.commandBus.execute(new UpdatePracticeBenefitCommand(
      id,
      payload,
      files.image?.[0],
    ));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a practice benefit and remove image from cloud (Admin only)' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Practice benefit not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeletePracticeBenefitCommand(id));
  }
}
