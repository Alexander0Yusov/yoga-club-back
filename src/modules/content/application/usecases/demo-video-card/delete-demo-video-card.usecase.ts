import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DemoVideoCardRepository } from 'src/modules/content/infrastructure/demo-video-card.repository';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class DeleteDemoVideoCardCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteDemoVideoCardCommand)
export class DeleteDemoVideoCardUseCase implements ICommandHandler<DeleteDemoVideoCardCommand> {
  constructor(
    private readonly repository: DemoVideoCardRepository,
  ) {}

  async execute(command: DeleteDemoVideoCardCommand): Promise<void> {
    const card = await this.repository.getByIdOrNotFoundFail(command.id);

    if (card.deletedAt) {
      throw new DomainException({ code: DomainExceptionCode.NotFound, message: 'Demo video card already deleted' });
    }

    // POLICY: Soft delete should NOT delete the image in Cloudinary.
    card.softDelete();

    await this.repository.save(card);
  }
}
