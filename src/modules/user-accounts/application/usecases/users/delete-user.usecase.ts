import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserContextDto } from '../../../guards/dto/user-context.dto';
import { UsersRepository } from '../../../infrastructure/users.repository';

export class DeleteUserCommand {
  constructor(public dto: { userId: string }) {}
}

// @CommandHandler(DeleteUserCommand)
// export class DeleteUserUseCase
//   implements ICommandHandler<DeleteUserCommand, void>
// {
//   constructor(private usersRepository: UsersRepository) {}

//   async execute({ dto: { userId } }: DeleteUserCommand): Promise<void> {
//     await this.usersRepository.softDeleteById(Number(userId));
//   }
// }
