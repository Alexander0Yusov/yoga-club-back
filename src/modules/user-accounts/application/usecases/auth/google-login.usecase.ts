import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GoogleLoginDto } from '../../../dto/auth/google-login.dto';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { CoreConfig } from '../../../../../core/core.config';
import { OAuthLoginCommand } from './oauth-login.usecase';

export class GoogleLoginCommand {
  constructor(public readonly dto: GoogleLoginDto) {}
}

@CommandHandler(GoogleLoginCommand)
export class GoogleLoginUseCase
  implements ICommandHandler<GoogleLoginCommand, string>
{
  private client: OAuth2Client;

  constructor(
    private readonly coreConfig: CoreConfig,
    private readonly commandBus: CommandBus,
  ) {
    this.client = new OAuth2Client();
  }

  async execute(command: GoogleLoginCommand): Promise<string> {
    const { idToken } = command.dto;

    // 1. Config Guard
    if (!this.coreConfig.googleClientId) {
      throw new InternalServerErrorException(
        'Google Auth is not configured on the server',
      );
    }

    try {
      // 2. Verify ID Token
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.coreConfig.googleClientId,
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const { sub, email, name, picture } = payload;

      // 3. Sync User via existing OAuthLoginCommand
      const userId = await this.commandBus.execute(
        new OAuthLoginCommand('google', sub, email, name, picture),
      );

      return userId;
    } catch (error) {
      console.error('Google token validation failed:', error);
      throw new UnauthorizedException('Google token validation failed');
    }
  }
}
