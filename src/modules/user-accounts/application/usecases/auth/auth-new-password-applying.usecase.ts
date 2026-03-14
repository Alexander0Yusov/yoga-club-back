import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CryptoService } from '../../crupto.service';
import { PasswordRecoveryDto } from '../../../dto/user/password-recovery.dto';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class AuthNewPasswordApplyingCommand {
  constructor(public dto: PasswordRecoveryDto) {}
}

@CommandHandler(AuthNewPasswordApplyingCommand)
export class AuthNewPasswordApplyingUseCase
  implements ICommandHandler<AuthNewPasswordApplyingCommand, void>
{
  constructor(
    private cryptoService: CryptoService,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    dto: { newPassword, recoveryCode },
  }: AuthNewPasswordApplyingCommand): Promise<void> {
    try {
      const user =
        await this.usersRepository.findByPasswordRecoveryCodeOrNotFoundFail(
          recoveryCode,
        );

      const passwordHash =
        await this.cryptoService.createPasswordHash(newPassword);

      user.setNewPassword(passwordHash);

      await this.usersRepository.save(user);
    } catch (er) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Something wrong with code',
        extensions: [
          {
            field: 'recoveryCode',
            message:
              'The recovery code is incorrect, expired or already been applied',
          },
        ],
      });
    }
  }
}
