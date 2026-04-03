import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HeroIntroRepository } from 'src/modules/content/infrastructure/hero-intro.repository';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { extractPublicIdFromUrl } from 'src/modules/media/utils/cloudinary-url.util';

export class DeleteHeroIntroCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteHeroIntroCommand)
export class DeleteHeroIntroUseCase implements ICommandHandler<DeleteHeroIntroCommand> {
  constructor(
    private readonly repository: HeroIntroRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(command: DeleteHeroIntroCommand): Promise<void> {
    const heroIntro = await this.repository.getByIdOrNotFoundFail(command.id);

    if (heroIntro.deletedAt) {
      throw new DomainException({ code: DomainExceptionCode.NotFound, message: 'HeroIntro not found' });
    }

    const publicIdsToDelete: string[] = [];

    if (heroIntro.image?.publicId) {
      publicIdsToDelete.push(heroIntro.image.publicId);
    } else if (heroIntro.image?.url) {
      const id = extractPublicIdFromUrl(heroIntro.image.url);
      if (id) publicIdsToDelete.push(id);
    }

    heroIntro.softDelete();
    heroIntro.image = undefined;

    await this.repository.save(heroIntro);

    const validIds = publicIdsToDelete.filter(Boolean);
    await Promise.allSettled(validIds.map(id => this.cloudinaryService.deleteImage(id)));
  }
}
