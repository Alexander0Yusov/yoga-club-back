import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { SessionInputDto } from '../../../dto/session/session-input.dto';
import { REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from '../../../constants/auth-tokens.inject-constants';
import { SessionsRepository } from '../../../infrastructure/sessions.repository';
import { JwtRefreshPayload } from '../../../dto/session/jwt-refresh-payload.dto';
import {
  Session,
  type SessionModelType,
} from '../../../domain/session/session.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export class CreateSessionCommand {
  constructor(public dto: SessionInputDto) {}
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase
  implements ICommandHandler<CreateSessionCommand, void>
{
  constructor(
    @InjectModel(Session.name)
    private SessionModel: SessionModelType,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private sessionsRepository: SessionsRepository,
  ) {}

  async execute({ dto }: CreateSessionCommand): Promise<void> {
    const { id, deviceId, iat, exp } = (await this.refreshTokenContext.decode(
      dto.refreshToken,
    )) as unknown as JwtRefreshPayload;

    const newSession = Session.createInstance({
      deviceId: deviceId,
      userId: new Types.ObjectId(id),
      ip: dto.ip,
      deviceName: dto.deviceName,
      expiresAt: new Date(exp * 1000),
      lastActiveDate: new Date(iat * 1000),
      isRevoked: false,
    });

    const session = this.SessionModel.createInstance(newSession);

    await this.sessionsRepository.save(session);
  }
}
