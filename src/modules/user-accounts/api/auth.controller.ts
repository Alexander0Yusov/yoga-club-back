import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request as Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserInputDto } from '../dto/user/user-input.dto';
import { LocalAuthGuard } from '../guards/local/local-auth.guard';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request.decorator';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { MeViewDto } from '../dto/user/user-view.dto';
import { UpdateUserDto } from '../dto/user/create-user-domain.dto';
import { PasswordRecoveryDto } from '../dto/user/password-recovery.dto';
import { ConfirmationCodeDto } from '../dto/user/confirmation-code.dto';
import type { Request, Response } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTokensPairCommand } from '../application/usecases/auth/create-tokens-pair.usecase';
import { CreateSessionCommand } from '../application/usecases/sessions/create-session.usecase';
import { RefreshJwtAuthGuard } from '../guards/bearer-refresh/refresh-jwt-auth.guard';
import { DeviceContextDto } from '../guards/dto/device-context.dto';
import { Device } from '../guards/decorators/param/extract-user-from-cookie.decorator';
import { RevokingSessionCommand } from '../application/usecases/sessions/revoking-session.usecase';
import { Throttle } from '@nestjs/throttler';
import { UpdateSessionCommand } from '../application/usecases/sessions/update-session.usecase';
import { AuthRegisterCommand } from '../application/usecases/auth/auth-register.usecase';
import { AuthEmailConfirmationCommand } from '../application/usecases/auth/auth-email-confirmation.usecase';
import { AuthEmailResendConfirmationCommand } from '../application/usecases/auth/auth-email-resend-confirmation.usecase';
import { AuthSendRecoveryPasswordCodeCommand } from '../application/usecases/auth/auth-send-recovery-password-code.usecase';
import { AuthNewPasswordApplyingCommand } from '../application/usecases/auth/auth-new-password-applying.usecase';
import { UsersQueryRepository } from '../infrastructure/query/users-query.repository';
import { AuthGuard } from '@nestjs/passport';
import { OAuthLoginCommand } from '../application/usecases/auth/oauth-login.usecase';
import { GoogleLoginDto } from '../dto/auth/google-login.dto';
import { GoogleLoginCommand } from '../application/usecases/auth/google-login.usecase';
import { Language } from '../domain/user/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';

import { LanguageSyncInterceptor } from '../interceptors/language-sync.interceptor';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(LanguageSyncInterceptor)
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private usersQueryRepository: UsersQueryRepository,
    private usersRepository: UsersRepository,
  ) {}

  @Post('register')
  @Throttle({ default: {} })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({
    type: UserInputDto,
    examples: {
      default: {
        summary: 'Default',
        value: {
          name: 'john_doe',
          email: 'user@mail.com',
          password: 'qwerty',
        },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'Registration accepted' })
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
  async registration(
    @Body() body: UserInputDto,
    @Req() req: Request,
  ): Promise<void> {
    console.log(55555, body);
    const lang = this.resolveRequestLang(req);
    await this.commandBus.execute(new AuthRegisterCommand({ ...body, lang }));
  }

  @Post('login')
  @Throttle({ default: {} })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login and receive access token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@mail.com' },
        password: { type: 'string', example: 'qwerty' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Authenticated (refresh token is set as httpOnly cookie)',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['accessToken'],
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
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    console.log(66666, user);

    const ip = req.ip as string;

    const deviceName = req.get('user-agent') || 'Unknown device';

    const { accessToken, refreshToken } = await this.commandBus.execute(
      new CreateTokensPairCommand({
        userId: user.id,
        lang: user.lang,
        isLanguageManual: user.isLanguageManual,
      }),
    );

    await this.commandBus.execute(
      new CreateSessionCommand({ refreshToken, ip, deviceName }),
    );

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // true in prod, false in dev for http
    });

    return { accessToken };
  }

  @Post('refresh')
  @UseGuards(RefreshJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refreshToken')
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiResponse({
    status: 200,
    description: 'Token pair refreshed (new refresh token is set as cookie)',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['accessToken'],
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
  async refreshToken(
    @Device() deviceContext: DeviceContextDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    console.log(77777, 'refreshToken');

    const { accessToken, refreshToken } = await this.commandBus.execute(
      new CreateTokensPairCommand({
        userId: deviceContext.id,
        deviceId: deviceContext.deviceId,
        lang: deviceContext.lang,
        isLanguageManual: deviceContext.isLanguageManual,
      }),
    );

    await this.commandBus.execute(new UpdateSessionCommand({ refreshToken }));

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // true in prod, false in dev for http
    });

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RefreshJwtAuthGuard)
  @ApiCookieAuth('refreshToken')
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 204, description: 'Logged out' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'Unauthorized' } },
      example: { message: 'Unauthorized' },
    },
  })
  async logout(@Device() deviceContext: DeviceContextDto): Promise<void> {
    await this.commandBus.execute(
      new RevokingSessionCommand({ deviceId: deviceContext.deviceId }),
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user', type: MeViewDto })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'Unauthorized' } },
      example: { message: 'Unauthorized' },
    },
  })
  async me(@ExtractUserFromRequest() user: UserContextDto): Promise<MeViewDto> {
    return await this.usersQueryRepository.findMeByIdOrNotFindFail(user.id);
  }

  @Post('password-recovery')
  @Throttle({ default: {} })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Send password recovery email' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      default: {
        summary: 'Default',
        value: { email: 'user@mail.com' },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'Recovery email requested' })
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
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: { message: { type: 'string', example: 'User not found' } },
      example: { message: 'User not found' },
    },
  })
  async passwordRecovery(@Body() body: UpdateUserDto, @Req() req: Request) {
    const lang = this.resolveRequestLang(req);
    await this.commandBus.execute(
      new AuthSendRecoveryPasswordCodeCommand({ ...body, lang }),
    );
  }

  @Post('new-password')
  @Throttle({ default: {} })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Set a new password by recovery code' })
  @ApiBody({
    type: PasswordRecoveryDto,
    examples: {
      default: {
        summary: 'Default',
        value: {
          newPassword: 'new_password_123',
          recoveryCode: 'f5b9f1b0-1c2d-4b95-9a2b-2b1c9c8f2a1b',
        },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'Password changed' })
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
              field: { type: 'string', example: 'recoveryCode' },
            },
          },
        },
      },
      example: {
        errorsMessages: [
          { message: 'Validation error', field: 'recoveryCode' },
        ],
      },
    },
  })
  async newPassword(@Body() body: PasswordRecoveryDto) {
    await this.commandBus.execute(new AuthNewPasswordApplyingCommand(body));
  }

  @Post('registration-confirmation')
  @Throttle({ default: {} })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Confirm registration email' })
  @ApiBody({
    type: ConfirmationCodeDto,
    examples: {
      default: {
        summary: 'Default',
        value: { code: 'f5b9f1b0-1c2d-4b95-9a2b-2b1c9c8f2a1b' },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'Email confirmed' })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired confirmation code',
    schema: {
      type: 'object',
      properties: {
        errorsMessages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Invalid or expired confirmation code',
              },
              field: { type: 'string', example: 'code' },
            },
          },
        },
      },
      example: {
        errorsMessages: [
          { message: 'Invalid or expired confirmation code', field: 'code' },
        ],
      },
    },
  })
  async registrationConfirmation(@Body() body: ConfirmationCodeDto) {
    console.log(77777, body);
    

    await this.commandBus.execute(new AuthEmailConfirmationCommand(body));
  }

  @Post('registration-email-resending')
  @Throttle({ default: {} })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Resend registration confirmation email' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      default: {
        summary: 'Default',
        value: { email: 'user@mail.com' },
      },
    },
  })
  @ApiResponse({ status: 204, description: 'Confirmation email resent' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or email already confirmed',
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
  async registrationEmailResending(@Body() body: UpdateUserDto) {
    await this.commandBus.execute(new AuthEmailResendConfirmationCommand(body));
    // овторная отправка письма с подтверждением
  }

  @Post('google-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Google ID Token' })
  @ApiResponse({
    status: 200,
    description: 'Authenticated (refresh token is set as httpOnly cookie)',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
      },
    },
  })
  async googleLogin(
    @Body() body: GoogleLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string }> {
    const userId = await this.commandBus.execute(new GoogleLoginCommand(body));

    // For googleLogin, we need the user to get their lang/isLanguageManual.
    const user = await this.usersRepository.findById(userId);
    
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new CreateTokensPairCommand({
        userId,
        lang: user?.lang || Language.RU,
        isLanguageManual: user?.isLanguageManual || false,
      }),
    );

    await this.commandBus.execute(
      new CreateSessionCommand({
        refreshToken,
        ip: req.ip || '0.0.0.0',
        deviceName: req.headers['user-agent'] || 'Unknown',
      }),
    );

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return { accessToken };
  }

  private resolveRequestLang(req: Request): string {
    const header =
      (req.headers['x-client-lang'] as string) ||
      (req.headers['accept-language'] as string) ||
      'en';

    const match = header.match(/^([a-z]{2})/i);
    const lang = match ? match[1].toLowerCase() : 'en';

    return ['en', 'ru', 'uk', 'de'].includes(lang) ? lang : 'en';
  }
}
