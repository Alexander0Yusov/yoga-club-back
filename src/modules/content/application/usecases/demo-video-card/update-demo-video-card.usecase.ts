import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { DemoVideoCardRepository } from 'src/modules/content/infrastructure/demo-video-card.repository';
import { UpdateDemoVideoCardDto } from 'src/modules/content/api/dto/demo-video-card.dto';
import { CarouselImage } from 'src/modules/content/domain/carousel-image.vo';
import { extractPublicIdFromUrl } from 'src/modules/media/utils/cloudinary-url.util';

export class UpdateDemoVideoCardCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateDemoVideoCardDto,
    public readonly file?: Express.Multer.File,
  ) {}
}

@CommandHandler(UpdateDemoVideoCardCommand)
export class UpdateDemoVideoCardUseCase implements ICommandHandler<UpdateDemoVideoCardCommand> {
  constructor(
    private readonly repository: DemoVideoCardRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: UpdateDemoVideoCardCommand): Promise<void> {
    const { id, dto, file } = command;
    const card = await this.repository.getByIdOrNotFoundFail(id);
    
    let newUploadPublicId: string | undefined;
    const oldPublicId = card.thumbnail?.publicId || extractPublicIdFromUrl(card.thumbnail?.url || '');

    try {
      // 1. Translations
      const [title, description] = await Promise.all([
        dto.title ? this.translationService.translateMissing(dto.title) : undefined,
        dto.description ? this.translationService.translateMissing(dto.description) : undefined,
      ]);

      // 2. Image Update Cycle (New Upload -> DB Update -> On Success: Old Destroy)
      let thumbnail = card.thumbnail;
      if (file) {
        const res = await this.cloudinaryService.uploadImageWithDetails(file, 'demo-video-thumbnails');
        newUploadPublicId = res.publicId;
        // Fallback alt to title (updated or current)
        const alt = title || card.title;
        thumbnail = new CarouselImage(res.url, alt, res.publicId);
      } else if (dto.thumbnail) {
        // Handle JSON metadata updates (like alt text) without new file
        const alt = dto.thumbnail.alt ? await this.translationService.translateMissing(dto.thumbnail.alt) : (title || card.title);
        thumbnail = new CarouselImage(dto.thumbnail.url, alt, dto.thumbnail.publicId);
      }

      // 3. Update and Save
      Object.assign(card, {
        ...dto,
        ...(title && { title }),
        ...(description && { description }),
        thumbnail,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : card.publishedAt,
      });

      await this.repository.save(card);

      // 4. Success: Purge OLD image (if it's different and not null)
      if (file && oldPublicId && oldPublicId !== newUploadPublicId) {
        await this.cloudinaryService.deleteImage(oldPublicId);
      }
    } catch (error) {
      // 5. Failure: Rollback NEW image
      if (newUploadPublicId) {
        await this.cloudinaryService.deleteImage(newUploadPublicId);
      }
      throw error;
    }
  }
}
