import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../../constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { Language } from '../../../domain/user/user.entity';

export class CreateTokensPairCommand {
  constructor(
    public dto: {
      userId: string;
      deviceId?: string;
      lang: Language;
      isLanguageManual: boolean;
    },
  ) {}
}

@CommandHandler(CreateTokensPairCommand)
export class CreateTokensPairUseCase
  implements ICommandHandler<CreateTokensPairCommand>
{
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
  ) {}

  async execute({ dto }: CreateTokensPairCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = this.accessTokenContext.sign({
      id: dto.userId,
      lang: dto.lang,
      isLanguageManual: dto.isLanguageManual,
    });

    const refreshToken = this.refreshTokenContext.sign({
      id: dto.userId,
      deviceId: dto.deviceId || uuidv4().toString(),
      lang: dto.lang,
      isLanguageManual: dto.isLanguageManual,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
