import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
  User,
  UserDocument,
  type UserModelType,
} from '../domain/user/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async save(user: UserDocument) {
    await user.save();
  }

  async findByEmailOrNotFoundFail(email: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({ email });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return user;
  }

  async findByIdOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.UserModel.findById(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return user;
  }

  // async findByLoginOrEmailOrNotFoundFail(loginOrEmail: string): Promise<User> {
  //   const user = await this.userRepo.findOne({
  //     where: [
  //       { login: loginOrEmail, deletedAt: IsNull() },
  //       { email: loginOrEmail, deletedAt: IsNull() },
  //     ],
  //     relations: ['emailConfirmation'],
  //   });

  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   return user;
  // }

  async findByEmail(email: string): Promise<User | null> {
    // проверить на неудаление +/- !!!
    const user = await this.UserModel.findOne({ email });

    return user ?? null;
  }

  // async getUserAndEmailConfirmationDataByCodeOrNotFounFail(
  //   code: string,
  // ): Promise<User> {
  //   const user = await this.userRepo.findOne({
  //     where: {
  //       deletedAt: IsNull(),
  //       emailConfirmation: {
  //         confirmationCode: code,
  //         isConfirmed: false,
  //         expirationDate: MoreThan(new Date()),
  //       },
  //     },
  //     relations: ['emailConfirmation'],
  //   });

  //   if (!user) {
  //     throw new NotFoundException('Code not found');
  //   }

  //   return user;
  // }

  // async getUserAndPasswordConfirmationDataOrNotFounFail(
  //   code: string,
  // ): Promise<User> {
  //   const user = await this.userRepo.findOne({
  //     where: {
  //       deletedAt: IsNull(),
  //       passwordRecoveries: {
  //         confirmationCode: code,
  //         expirationDate: MoreThan(new Date()),
  //         isConfirmed: false,
  //       },
  //     },
  //     relations: ['passwordRecoveries'],
  //   });

  //   if (!user) {
  //     throw new NotFoundException();
  //   }

  //   return user;
  // }

  // async softDeleteById(id: number): Promise<void> {
  //   const user = await this.userRepo.findOne({ where: { id } });

  //   if (!user) {
  //     throw new NotFoundException(`User with id ${id} not found`);
  //   }

  //   await this.userRepo.softRemove(user);
  // }
}
