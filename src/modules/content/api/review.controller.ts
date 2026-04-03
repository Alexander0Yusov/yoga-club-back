import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateReviewCommand } from '../application/usecases/review/create-review.usecase';
import { UpdateReviewCommand } from '../application/usecases/review/update-review.usecase';
import { DeleteReviewCommand } from '../application/usecases/review/delete-review.usecase';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { ReviewRepository } from '../infrastructure/review.repository';
import { APIErrorResult } from 'src/core/dto/error-result.dto';

@ApiTags('Admin: Content')
@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly repository: ReviewRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active reviews' })
  async findAll() {
    return this.repository.findAll();
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get reviews by event ID' })
  async findByEventId(@Param('eventId') eventId: string) {
    return this.repository.findByEventId(eventId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create a new review (Admin only)' })
  @ApiResponse({ status: 201, description: 'Created' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  async create(@Body() payload: CreateReviewDto): Promise<string> {
    return this.commandBus.execute(new CreateReviewCommand(payload));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update an existing review (Admin only)' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateReviewDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateReviewCommand(id, payload));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a review (Admin only)' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteReviewCommand(id));
  }
}
