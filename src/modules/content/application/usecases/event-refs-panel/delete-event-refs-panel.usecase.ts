import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventRefsPanelRepository } from 'src/modules/content/infrastructure/event-refs-panel.repository';

export class DeleteEventRefsPanelCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteEventRefsPanelCommand)
export class DeleteEventRefsPanelUseCase implements ICommandHandler<DeleteEventRefsPanelCommand> {
  constructor(
    private readonly repository: EventRefsPanelRepository,
  ) {}

  async execute(command: DeleteEventRefsPanelCommand): Promise<void> {
    const panel = await this.repository.getByIdOrNotFoundFail(command.id);

    panel.softDelete();

    await this.repository.save(panel);
  }
}
