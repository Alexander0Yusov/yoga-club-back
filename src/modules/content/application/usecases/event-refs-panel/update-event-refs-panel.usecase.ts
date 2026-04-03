import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventRefsPanelRepository } from 'src/modules/content/infrastructure/event-refs-panel.repository';
import { UpdateEventRefsPanelDto } from 'src/modules/content/api/dto/event-refs-panel.dto';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';

export class UpdateEventRefsPanelCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateEventRefsPanelDto,
    public readonly files: {
      leftRefImage?: Express.Multer.File;
      rightRefImage?: Express.Multer.File;
    },
  ) {}
}

@CommandHandler(UpdateEventRefsPanelCommand)
export class UpdateEventRefsPanelUseCase implements ICommandHandler<UpdateEventRefsPanelCommand> {
  constructor(
    private readonly repository: EventRefsPanelRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(command: UpdateEventRefsPanelCommand): Promise<void> {
    const { id, dto, files } = command;
    const panel = await this.repository.getByIdOrNotFoundFail(id);

    const oldLeft = panel.leftRefImage;
    const oldRight = panel.rightRefImage;

    let newLeft = panel.leftRefImage;
    let newRight = panel.rightRefImage;

    const purgeQueue: string[] = [];

    // Atomic update for left image
    if (files.leftRefImage) {
      const uploaded = await this.cloudinaryService.uploadImageWithDetails(files.leftRefImage, 'event-refs');
      newLeft = {
        url: uploaded.url,
        publicId: uploaded.publicId,
        alt: dto.leftRefImage?.alt || panel.leftRefImage.alt,
      };
      if (oldLeft.publicId) purgeQueue.push(oldLeft.publicId);
    } else if (dto.leftRefImage?.alt) {
      newLeft.alt = dto.leftRefImage.alt;
    }

    // Atomic update for right image
    if (files.rightRefImage) {
      const uploaded = await this.cloudinaryService.uploadImageWithDetails(files.rightRefImage, 'event-refs');
      newRight = {
        url: uploaded.url,
        publicId: uploaded.publicId,
        alt: dto.rightRefImage?.alt || panel.rightRefImage.alt,
      };
      if (oldRight.publicId) purgeQueue.push(oldRight.publicId);
    } else if (dto.rightRefImage?.alt) {
      newRight.alt = dto.rightRefImage.alt;
    }

    panel.leftRefImage = newLeft;
    panel.rightRefImage = newRight;

    // Persist to DB
    await this.repository.save(panel);

    // Only upon success: Purge old assets
    if (purgeQueue.length > 0) {
      await Promise.all(purgeQueue.map(id => this.cloudinaryService.deleteImage(id)));
    }
  }
}
