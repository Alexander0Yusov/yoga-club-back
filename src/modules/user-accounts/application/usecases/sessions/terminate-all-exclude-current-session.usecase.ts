import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceContextDto } from '../../../guards/dto/device-context.dto';
import { SessionsRepository } from '../../../infrastructure/sessions.repository';

export class TerminateAllExcludeCurrentSessionCommand {
  constructor(public dto: { userId: string; deviceId: string }) {}
}

// @CommandHandler(TerminateAllExcludeCurrentSessionCommand)
// export class TerminateAllExcludeCurrentSessionUseCase
//   implements ICommandHandler<TerminateAllExcludeCurrentSessionCommand, void>
// {
//   constructor(private sessionsRepository: SessionsRepository) {}

//   async execute({
//     dto,
//   }: TerminateAllExcludeCurrentSessionCommand): Promise<void> {
//     await this.sessionsRepository.deleteManyExceptCurrent(
//       Number(dto.userId),
//       dto.deviceId,
//     );
//   }
// }
