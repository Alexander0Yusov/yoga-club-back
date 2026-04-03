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
import { CreateSectionCommand } from '../application/usecases/sections/create-section.usecase';
import { UpdateSectionCommand } from '../application/usecases/sections/update-section.usecase';
import { DeleteSectionCommand } from '../application/usecases/sections/delete-section.usecase';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { SectionsRepository } from '../infrastructure/sections.repository';
import { APIErrorResult } from 'src/core/dto/error-result.dto';

@ApiTags('Admin: Sections')
@Controller('sections')
export class SectionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly repository: SectionsRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active sections' })
  async findAll() {
    return this.repository.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get section by ID' })
  async findById(@Param('id') id: string) {
    return this.repository.getByIdOrNotFoundFail(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Create a new section (Admin only)' })
  @ApiResponse({ status: 201, type: String, description: 'ID of the created section' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin role required' })
  async create(@Body() payload: CreateSectionDto): Promise<string> {
    return this.commandBus.execute(new CreateSectionCommand(payload));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update an existing section (Admin only)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, type: APIErrorResult, description: 'Validation errors' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateSectionDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateSectionCommand(id, payload));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a section (Admin only)' })
  @ApiResponse({ status: 204, description: 'No content' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteSectionCommand(id));
  }
}
