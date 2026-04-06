import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  Patch,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UploadedFile,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from '../application/users.service';
import { UserInputDto } from '../dto/user/user-input.dto';
import { MeViewDto, UserViewDto, UserProfileUpdateViewDto } from '../dto/user/user-view.dto';
import { UsersQueryRepository } from '../infrastructure/query/users-query.repository';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../dto/user/get-users-query-params.input-dto';
import { UpdateUserDto } from '../dto/user/create-user-domain.dto';
import { BasicAuthGuard } from '../guards/basic/basi-auth.guard';
import { UsersRepository } from '../infrastructure/users.repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/usecases/users/create-user.usecase';
import { DeleteUserCommand } from '../application/usecases/users/delete-user.usecase';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiBasicAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { UpdateUserProfileDto } from '../dto/user/update-user-profile.dto';
import { UpdateUserProfileApiDto } from '../dto/user/update-user-profile-api.dto';
import { UpdateUserProfileCommand } from '../application/usecases/users/update-user-profile.usecase';

export const FILE_SIZE_LIMIT = 2 * 1024 * 1024; // 2MB
export const ALLOWED_FILE_TYPES = /(jpg|jpeg|png|webp)$/;

@SkipThrottle()
@ApiTags('Users')
@Controller()
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private usersService: UsersService,
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @Post('users')
  @ApiOperation({ summary: 'Create user (legacy route)' })
  @ApiResponse({ status: 201, description: 'User created', type: UserViewDto })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'Unauthorized' } },
      example: { message: 'Unauthorized' },
    },
  })
  async create(@Body() dto: UserInputDto): Promise<UserViewDto | null> {
    // const userId = await this.usersService.createUser(dto);

    return null;
  }

  // +
  @Get('sa/users/:id')
  @UseGuards(BasicAuthGuard)
  @ApiOperation({ summary: 'Get user by id (legacy route)' })
  @ApiParam({ name: 'id', type: String, description: 'User id' })
  @ApiResponse({ status: 200, description: 'User found', type: UserViewDto })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'User not found' } },
      example: { message: 'User not found' },
    },
  })
  async getById(@Param('id') id: string): Promise<UserViewDto | null> {
    return await this.usersQueryRepository.findByIdOrNotFoundFail(id);
  }

  @Get('users')
  // @UseGuards(BasicAuthGuard)
  @ApiOperation({ summary: 'Get users (legacy route)' })
  @ApiQuery({ name: 'searchLoginTerm', required: false, type: String })
  @ApiQuery({ name: 'searchEmailTerm', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortDirection', required: false, type: String })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiExtraModels(PaginatedViewDto, UserViewDto)
  @ApiResponse({
    status: 200,
    description: 'Users returned',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedViewDto) },
        {
          properties: {
            items: {
              type: 'array',
              items: { $ref: getSchemaPath(UserViewDto) },
            },
          },
        },
      ],
    },
  })
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]> | string> {
    // return await this.usersQueryRepository.getAll(query);

    return '';
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user (legacy route)' })
  @ApiParam({ name: 'id', type: String, description: 'User id' })
  @ApiResponse({ status: 200, description: 'User updated', type: UserViewDto })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'User not found' } },
      example: { message: 'User not found' },
    },
  })
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<UserViewDto | null> {
    // const userId = await this.usersService.update(id, body);
    // return this.usersQueryRepository.findByIdOrNotFoundFail('userId');
    return null;
  }

  @Delete('users/:id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (legacy route)' })
  @ApiParam({ name: 'id', type: String, description: 'User id' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'Unauthorized' } },
      example: { message: 'Unauthorized' },
    },
  })
  async deleteUser(@Param('id') id: string): Promise<void> {
    // return this.usersService.deleteUser(id);
  }

  // +
  @Post('sa/users')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @ApiOperation({ summary: 'Create user (SA)' })
  @ApiResponse({ status: 201, description: 'User created', type: UserViewDto })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      type: 'object',
      properties: {
        errorsMessages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Validation error' },
              field: { type: 'string', example: 'email' },
            },
          },
        },
      },
      example: {
        errorsMessages: [{ message: 'Validation error', field: 'email' }],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'Unauthorized' } },
      example: { message: 'Unauthorized' },
    },
  })
  async createBySa(@Body() dto: UserInputDto): Promise<UserViewDto | null> {
    const userId = await this.commandBus.execute(new CreateUserCommand(dto));

    return await this.usersQueryRepository.findByIdOrNotFoundFail(userId);
  }

  // +
  @Get('sa/users')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users (SA)' })
  @ApiQuery({ name: 'searchLoginTerm', required: false, type: String })
  @ApiQuery({ name: 'searchEmailTerm', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortDirection', required: false, type: String })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiExtraModels(PaginatedViewDto, UserViewDto)
  @ApiResponse({
    status: 200,
    description: 'Users returned',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedViewDto) },
        {
          properties: {
            items: {
              type: 'array',
              items: { $ref: getSchemaPath(UserViewDto) },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'Unauthorized' } },
      example: { message: 'Unauthorized' },
    },
  })
  async getAllBySa(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return await this.usersQueryRepository.getAll(query);
  }

  @Delete('sa/users/:id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by id (SA)' })
  @ApiParam({ name: 'id', type: String, description: 'User id' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'User not found' } },
      example: { message: 'User not found' },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'Unauthorized' } },
      example: { message: 'Unauthorized' },
    },
  })
  async deleteBySa(@Param('id') id: string): Promise<void> {
    // return this.usersService.deleteUser(id);
    await this.commandBus.execute(new DeleteUserCommand({ userId: id }));
  }

  @Patch('users/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates the authenticated user profile. Supports partial updates for name, telephone, subscription status, and avatar upload (multipart/form-data).',
  })
  @ApiBody({
    type: UpdateUserProfileApiDto,
    description: 'Profile update data with optional avatar file',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile updated successfully',
    type: UserProfileUpdateViewDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed (e.g., file too large, invalid phone format)',
  })
  @ApiResponse({
  })
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: UpdateUserProfileDto,
    @Res({ passthrough: true }) res: Response,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: FILE_SIZE_LIMIT }),
          new FileTypeValidator({ fileType: ALLOWED_FILE_TYPES }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ): Promise<UserProfileUpdateViewDto> {
    const rawIsSubscribed = body.isSubscribed as unknown;
    const normalizedIsSubscribed =
      rawIsSubscribed === undefined
        ? undefined
        : rawIsSubscribed === true ||
            rawIsSubscribed === 'true' ||
            rawIsSubscribed === 1 ||
            rawIsSubscribed === '1';

    await this.commandBus.execute(
      new UpdateUserProfileCommand(
        user.id,
        body.name,
        body.telephone,
        file,
        normalizedIsSubscribed,
        body.lang,
      ),
    );

    const updatedUser = (await this.usersRepository.findById(user.id))!;

    // Sync lang_synced cookie immediately on manual update
    res.cookie('lang_synced', updatedUser.lang, {
      maxAge: 86400000, // 24h
      signed: true,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });

    return UserProfileUpdateViewDto.mapToView(updatedUser);
  }
}
