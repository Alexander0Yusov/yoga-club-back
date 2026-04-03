import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AboutMeCardRepository } from 'src/modules/content/infrastructure/about-me-card.repository';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class DeleteAboutMeCardCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteAboutMeCardCommand)
export class DeleteAboutMeCardUseCase implements ICommandHandler<DeleteAboutMeCardCommand> {
  constructor(
    private readonly repository: AboutMeCardRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(command: DeleteAboutMeCardCommand): Promise<void> {
    const card = await this.repository.getByIdOrNotFoundFail(command.id);

    if (card.deletedAt) {
      throw new DomainException({ code: DomainExceptionCode.NotFound, message: 'AboutMeCard not found' });
    }

    const publicIdsToDelete: string[] = [];

    if (card.left?.image?.publicId) {
      publicIdsToDelete.push(card.left.image.publicId);
    }
    
    if (card.right?.image?.publicId) {
      publicIdsToDelete.push(card.right.image.publicId);
    }

    card.softDelete();
    
    if (card.left) card.left.image = undefined;
    if (card.right) card.right.image = undefined;

    await this.repository.save(card);

    const validIds = publicIdsToDelete.filter(Boolean);
    await Promise.allSettled(validIds.map(id => this.cloudinaryService.deleteImage(id)));
  }
}
