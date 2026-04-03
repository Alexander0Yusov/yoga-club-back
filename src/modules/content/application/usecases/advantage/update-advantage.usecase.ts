import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { AdvantageRepository } from 'src/modules/content/infrastructure/advantage.repository';
import { UpdateAdvantageDto } from 'src/modules/content/api/dto/advantage.dto';
import { CarouselImage } from 'src/modules/content/domain/carousel-image.vo';
import { extractPublicIdFromUrl } from 'src/modules/media/utils/cloudinary-url.util';

export class UpdateAdvantageCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateAdvantageDto,
    public readonly file?: Express.Multer.File,
  ) {}
}

@CommandHandler(UpdateAdvantageCommand)
export class UpdateAdvantageUseCase implements ICommandHandler<UpdateAdvantageCommand> {
  constructor(
    private readonly repository: AdvantageRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: UpdateAdvantageCommand): Promise<void> {
    const { id, dto, file } = command;
    const advantage = await this.repository.getByIdOrNotFoundFail(id);
    
    const newUploads: string[] = [];
    const orphanPublicIds: string[] = [];

    try {
      // 1. Collect old publicId for potential cleanup
      if (advantage.image?.publicId) {
        orphanPublicIds.push(advantage.image.publicId);
      } else if (advantage.image?.url) {
        const id = extractPublicIdFromUrl(advantage.image.url);
        if (id) orphanPublicIds.push(id);
      }

      // 2. Translations
      const [title, text] = await Promise.all([
        dto.title ? this.translationService.translateMissing(dto.title) : undefined,
        dto.text ? this.translationService.translateMissing(dto.text) : undefined,
      ]);

      // 3. Image Update
      let image = advantage.image;
      if (file) {
        const res = await this.cloudinaryService.uploadImageWithDetails(file, 'advantages');
        newUploads.push(res.publicId);
        // Fallback alt to title (prefer updated title, then existing title)
        const alt = title || advantage.title;
        image = new CarouselImage(res.url, alt, res.publicId);
      } else if (dto.image) {
        // If only JSON data updated (e.g. alt changed)
        const alt = dto.image.alt ? await this.translationService.translateMissing(dto.image.alt) : (title || advantage.title);
        image = new CarouselImage(dto.image.url, alt, dto.image.publicId);
        
        // If the URL hasn't changed, we don't want to delete the old image
        const keptId = image.publicId || extractPublicIdFromUrl(image.url);
        const idx = orphanPublicIds.indexOf(keptId || 'none');
        if (idx > -1) orphanPublicIds.splice(idx, 1);
      }

      // 4. Update and Save
      Object.assign(advantage, {
        ...(title && { title }),
        ...(text && { text }),
        orderIndex: dto.orderIndex !== undefined ? dto.orderIndex : advantage.orderIndex,
        image,
      });

      await this.repository.save(advantage);

      // 5. Cleanup Old Assets
      await Promise.allSettled(orphanPublicIds.map(id => this.cloudinaryService.deleteImage(id)));
    } catch (error) {
      // Rollback New Uploads
      await Promise.allSettled(newUploads.map(id => this.cloudinaryService.deleteImage(id)));
      throw error;
    }
  }
}
