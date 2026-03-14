import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  SessionDocument,
  type SessionModelType,
} from '../domain/session/session.entity';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}

  async save(session: SessionDocument) {
    await session.save();
  }

  async findOrNotFoundFail(userId: string, deviceId: string): Promise<any> {
    // SessionDocument
    // const session = await this.SessionModel.findOne({
    //   userId: '', // new Types.ObjectId(userId),
    //   deviceId,
    // });

    // if (!session) {
    //   throw new DomainException({
    //     code: DomainExceptionCode.NotFound,
    //     message: 'Session not found',
    //   });
    // }

    return null; // session;
  }

  async findByDeviceId(deviceId: string): Promise<SessionDocument | null> {
    return this.SessionModel.findOne({ deviceId });
  }

  async updateExpAndIatTimesOrNotFoundFail(
    deviceId: string,
    expDate: Date,
    iatDate: Date,
  ): Promise<void> {
    const result = await this.SessionModel.updateOne(
      { deviceId },
      {
        $set: {
          expiresAt: expDate,
          lastActiveDate: iatDate,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
      });
    }
  }

  async revokingSessionByDeviceIdOrNotFoundFail(deviceId: string): Promise<void> {
    const result = await this.SessionModel.updateOne(
      { deviceId },
      { $set: { isRevoked: true } },
    );

    if (result.matchedCount === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
      });
    }
  }
}
