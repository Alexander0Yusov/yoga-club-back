import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { YogaDirectionRepository } from 'src/modules/content/infrastructure/yoga-direction.repository';
import { UpdateYogaDirectionDto } from 'src/modules/content/api/dto/yoga-direction.dto';
import { CarouselImage } from 'src/modules/content/domain/carousel-image.vo';
import { extractPublicIdFromUrl } from 'src/modules/media/utils/cloudinary-url.util';

export class UpdateYogaDirectionCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateYogaDirectionDto,
    public readonly file?: Express.Multer.File,
  ) {}
}

@CommandHandler(UpdateYogaDirectionCommand)
export class UpdateYogaDirectionUseCase implements ICommandHandler<UpdateYogaDirectionCommand> {
  constructor(
    private readonly repository: YogaDirectionRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: UpdateYogaDirectionCommand): Promise<void> {
    const { id, dto, file } = command;
    const direction = await this.repository.getByIdOrNotFoundFail(id);
    
    const newUploads: string[] = [];
    const orphanPublicIds: string[] = [];

    try {
      // 1. Collect old publicId for potential cleanup
      if (direction.image?.publicId) {
        orphanPublicIds.push(direction.image.publicId);
      } else if (direction.image?.url) {
        const id = extractPublicIdFromUrl(direction.image.url);
        if (id) orphanPublicIds.push(id);
      }

      // 2. Translations
      const [title, text] = await Promise.all([
        dto.title ? this.translationService.translateMissing(dto.title) : undefined,
        dto.text ? this.translationService.translateMissing(dto.text) : undefined,
      ]);

      // 3. Image Update
      let image = direction.image;
      if (file) {
        const res = await this.cloudinaryService.uploadImageWithDetails(file, 'yoga-directions');
        newUploads.push(res.publicId);
        // Fallback alt to title (prefer updated title, then existing title)
        const alt = title || direction.title;
        image = new CarouselImage(res.url, alt, res.publicId);
      } else if (dto.image) {
        // If only JSON data updated (e.g. alt changed)
        const alt = dto.image.alt ? await this.translationService.translateMissing(dto.image.alt) : (title || direction.title);
        image = new CarouselImage(dto.image.url, alt, dto.image.publicId);
        
        // If the URL hasn't changed, we don't want to delete the old image
        const keptId = image.publicId || extractPublicIdFromUrl(image.url);
        const idx = orphanPublicIds.indexOf(keptId || 'none');
        if (idx > -1) orphanPublicIds.splice(idx, 1);
      }

      // 4. Update and Save
      Object.assign(direction, {
        ...(title && { title }),
        ...(text && { text }),
        orderIndex: dto.orderIndex !== undefined ? dto.orderIndex : direction.orderIndex,
        image,
      });

      await this.repository.save(direction);

      // 5. Cleanup Old Assets
      await Promise.allSettled(orphanPublicIds.map(id => this.cloudinaryService.deleteImage(id)));
    } catch (error) {
      // Rollback New Uploads
      await Promise.allSettled(newUploads.map(id => this.cloudinaryService.deleteImage(id)));
      throw error;
    }
  }
}
