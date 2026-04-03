import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { User, type UserModelType } from '../../../domain/user/user.entity';
import { InjectModel } from '@nestjs/mongoose';

export class OAuthLoginCommand {
  constructor(
    public readonly provider: string,
    public readonly providerUserId: string,
    public readonly email: string,
    public readonly name?: string,
    public readonly avatarUrl?: string,
  ) {}
}

@CommandHandler(OAuthLoginCommand)
export class OAuthLoginUseCase
  implements ICommandHandler<OAuthLoginCommand, string>
{
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: OAuthLoginCommand): Promise<string> {
    const { provider, providerUserId, email, name, avatarUrl } = command;

    // 1. Поиск по email
    let user = await this.usersRepository.findByEmail(email);

    if (user) {
      // 2. Если пользователь найден по email, привязываем провайдера, если его еще нет
      user.linkOAuthProvider(
        provider,
        providerUserId,
        email,
        name,
        avatarUrl,
      );
      await this.usersRepository.save(user);
      return user.id;
    }

    // 3. (Опционально) Поиск по linked identity напрямую, если email может не совпадать.
    // Но так как OAuth (Google/Facebook) обычно дает email, мы можем остановиться на поиске по email.

    // 4. Если пользователя нет - создаем нового полностью через OAuth
    const newUser = this.UserModel.createOAuthUser(
      provider,
      providerUserId,
      email,
      name,
      avatarUrl,
    );

    await this.usersRepository.save(newUser);
    return newUser.id;
  }
}
