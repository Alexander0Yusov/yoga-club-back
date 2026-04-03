import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CryptoService } from '../../crupto.service';
import { UserInputDto } from '../../../dto/user/user-input.dto';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { User, type UserModelType } from '../../../domain/user/user.entity';
import { InjectModel } from '@nestjs/mongoose';

export class CreateUserCommand {
  constructor(public dto: UserInputDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserCommand, string>
{
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,

    private cryptoService: CryptoService,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    dto: { password, email },
  }: CreateUserCommand): Promise<string> {
    const existsEmail = await this.usersRepository.findByEmail(email);

    if (existsEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already exists',
        extensions: [{ message: 'Email already exists', field: 'email' }],
      });
    }

    const passwordHash = await this.cryptoService.createPasswordHash(password);

    const user = this.UserModel.createLocalUser(email, passwordHash);

    await this.usersRepository.save(user);

    return user.id;
  }
}
