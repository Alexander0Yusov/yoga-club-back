import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PracticeBenefitRepository } from 'src/modules/content/infrastructure/practice-benefit.repository';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { extractPublicIdFromUrl } from 'src/modules/media/utils/cloudinary-url.util';

export class DeletePracticeBenefitCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeletePracticeBenefitCommand)
export class DeletePracticeBenefitUseCase implements ICommandHandler<DeletePracticeBenefitCommand> {
  constructor(
    private readonly repository: PracticeBenefitRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(command: DeletePracticeBenefitCommand): Promise<void> {
    const benefit = await this.repository.getByIdOrNotFoundFail(command.id);

    if (benefit.deletedAt) {
      throw new DomainException({ code: DomainExceptionCode.NotFound, message: 'PracticeBenefit not found' });
    }

    const publicIdsToDelete: string[] = [];

    if (benefit.image?.publicId) {
      publicIdsToDelete.push(benefit.image.publicId);
    } else if (benefit.image?.url) {
      const id = extractPublicIdFromUrl(benefit.image.url);
      if (id) publicIdsToDelete.push(id);
    }

    benefit.softDelete();
    benefit.image = undefined;

    await this.repository.save(benefit);

    const validIds = publicIdsToDelete.filter(Boolean);
    await Promise.allSettled(validIds.map(id => this.cloudinaryService.deleteImage(id)));
  }
}
