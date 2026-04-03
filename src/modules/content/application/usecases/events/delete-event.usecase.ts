import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventsRepository } from 'src/modules/content/infrastructure/events.repository';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class DeleteEventCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteEventCommand)
export class DeleteEventUseCase implements ICommandHandler<DeleteEventCommand> {
  constructor(
    private readonly repository: EventsRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(command: DeleteEventCommand): Promise<void> {
    const event = await this.repository.getByIdOrNotFoundFail(command.id);

    if (event.deletedAt) {
      throw new DomainException({ code: DomainExceptionCode.NotFound, message: 'ClubEvent not found' });
    }

    const publicIdsToDelete: string[] = [];

    if (event.cover?.publicId) {
      publicIdsToDelete.push(event.cover.publicId);
    }
    
    if (event.gallery) {
      event.gallery.forEach(img => {
        if (img.publicId) publicIdsToDelete.push(img.publicId);
      });
    }

    event.softDelete();
    event.cover = undefined;
    event.gallery = [];

    await this.repository.save(event);

    const validIds = publicIdsToDelete.filter(Boolean);
    await Promise.allSettled(validIds.map(id => this.cloudinaryService.deleteImage(id)));
  }
}
