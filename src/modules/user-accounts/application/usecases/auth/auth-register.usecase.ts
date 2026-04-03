import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../users/create-user.usecase';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';
import { UserInputDto } from '../../../dto/user/user-input.dto';
import { EmailService } from '../../../../mailer/email.service';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { CoreConfig } from '../../../../../core/core.config';

export class AuthRegisterCommand {
  constructor(public dto: UserInputDto & { lang: string }) {}
}

@CommandHandler(AuthRegisterCommand)
export class AuthRegisterUseCase
  implements ICommandHandler<AuthRegisterCommand>
{
  constructor(
    private commandBus: CommandBus,
    private readonly emailService: EmailService,
    private readonly usersRepository: UsersRepository,
    private readonly coreConfig: CoreConfig,
  ) {}

  async execute({
    dto: { password, email, lang },
  }: AuthRegisterCommand): Promise<void> {
    await this.commandBus.execute(
      new CreateUserCommand({ password, email }),
    );

    const user = await this.usersRepository.findByEmailOrNotFoundFail(email);

    if (this.coreConfig.isUserAutomaticallyConfirmed) {
      user.setEmailIsConfirmed();
      await this.usersRepository.save(user);
      return;
    }

    // Этот код дублируется в повторной отправке письма и его лучше вынести в сервис?
    const confirmCode = uuidv4() as string;
    const expirationDate = addDays(new Date(), 2); // to env

    user.setEmailConfirmationCode(confirmCode, expirationDate);

    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(email, confirmCode, lang)
      .catch(console.error);
  }
}


