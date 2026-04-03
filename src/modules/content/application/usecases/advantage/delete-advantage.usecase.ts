import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AdvantageRepository } from 'src/modules/content/infrastructure/advantage.repository';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { extractPublicIdFromUrl } from 'src/modules/media/utils/cloudinary-url.util';

export class DeleteAdvantageCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteAdvantageCommand)
export class DeleteAdvantageUseCase implements ICommandHandler<DeleteAdvantageCommand> {
  constructor(
    private readonly repository: AdvantageRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(command: DeleteAdvantageCommand): Promise<void> {
    const advantage = await this.repository.getByIdOrNotFoundFail(command.id);

    if (advantage.deletedAt) {
      throw new DomainException({ code: DomainExceptionCode.NotFound, message: 'Advantage not found' });
    }

    const publicIdsToDelete: string[] = [];

    if (advantage.image?.publicId) {
      publicIdsToDelete.push(advantage.image.publicId);
    } else if (advantage.image?.url) {
      const id = extractPublicIdFromUrl(advantage.image.url);
      if (id) publicIdsToDelete.push(id);
    }

    advantage.softDelete();
    advantage.image = undefined;

    await this.repository.save(advantage);

    const validIds = publicIdsToDelete.filter(Boolean);
    await Promise.allSettled(validIds.map(id => this.cloudinaryService.deleteImage(id)));
  }
}
