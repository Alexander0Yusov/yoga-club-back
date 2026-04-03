import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SectionsRepository } from 'src/modules/content/infrastructure/sections.repository';

export class DeleteSectionCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteSectionCommand)
export class DeleteSectionUseCase implements ICommandHandler<DeleteSectionCommand> {
  constructor(
    private readonly repository: SectionsRepository,
  ) {}

  async execute(command: DeleteSectionCommand): Promise<void> {
    const section = await this.repository.getByIdOrNotFoundFail(command.id);

    section.softDelete();

    await this.repository.save(section);
  }
}
