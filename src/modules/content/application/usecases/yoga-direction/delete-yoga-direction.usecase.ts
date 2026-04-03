import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { YogaDirectionRepository } from 'src/modules/content/infrastructure/yoga-direction.repository';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { extractPublicIdFromUrl } from 'src/modules/media/utils/cloudinary-url.util';

export class DeleteYogaDirectionCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteYogaDirectionCommand)
export class DeleteYogaDirectionUseCase implements ICommandHandler<DeleteYogaDirectionCommand> {
  constructor(
    private readonly repository: YogaDirectionRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(command: DeleteYogaDirectionCommand): Promise<void> {
    const direction = await this.repository.getByIdOrNotFoundFail(command.id);

    if (direction.deletedAt) {
      throw new DomainException({ code: DomainExceptionCode.NotFound, message: 'Yoga direction not found' });
    }

    const publicIdsToDelete: string[] = [];

    if (direction.image?.publicId) {
      publicIdsToDelete.push(direction.image.publicId);
    } else if (direction.image?.url) {
      const id = extractPublicIdFromUrl(direction.image.url);
      if (id) publicIdsToDelete.push(id);
    }

    direction.softDelete();
    direction.image = undefined;

    await this.repository.save(direction);

    const validIds = publicIdsToDelete.filter(Boolean);
    await Promise.allSettled(validIds.map(id => this.cloudinaryService.deleteImage(id)));
  }
}
