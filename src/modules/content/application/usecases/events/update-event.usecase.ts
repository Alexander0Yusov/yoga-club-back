import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { EventsRepository } from 'src/modules/content/infrastructure/events.repository';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { LocalizedText } from 'src/modules/content/domain/localized-text.vo';
import { CarouselImage } from 'src/modules/content/domain/carousel-image.vo';
import { extractPublicIdFromUrl } from 'src/modules/media/utils/cloudinary-url.util';
import { UpdateEventDto } from 'src/modules/content/api/dto/events.dto';

export class UpdateEventCommand {
  constructor(
    public readonly eventId: string,
    public readonly dto: UpdateEventDto,
    public readonly coverFile?: Express.Multer.File,
    public readonly galleryFiles: Express.Multer.File[] = [],
  ) {}
}

@CommandHandler(UpdateEventCommand)
export class UpdateEventUseCase implements ICommandHandler<UpdateEventCommand> {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: UpdateEventCommand): Promise<void> {
    const { eventId, dto, coverFile, galleryFiles } = command;
    const event = await this.eventsRepository.getByIdOrNotFoundFail(eventId);
    
    const newUploads: string[] = [];
    const orphanPublicIds: string[] = [];

    try {
      // 1. Translation of primary fields
      const [title, content] = await Promise.all([
        this.translationService.translateMissing(dto.title),
        this.translationService.translateMissing(dto.content),
      ]);

      // 2. Handle Cover Upload & Orphan Tracking
      let cover = event.cover;
      if (coverFile) {
        const res = await this.cloudinaryService.uploadImageWithDetails(coverFile, 'events/covers');
        newUploads.push(res.publicId);
        
        if (event.cover?.publicId) orphanPublicIds.push(event.cover.publicId);
        else if (event.cover?.url) {
          const oldId = extractPublicIdFromUrl(event.cover.url);
          if (oldId) orphanPublicIds.push(oldId);
        }
        cover = new CarouselImage(res.url, title, res.publicId);
      } else if (dto.cover) {
        const alt = dto.cover.alt ? await this.translationService.translateMissing(dto.cover.alt) : title;
        cover = new CarouselImage(dto.cover.url, alt, dto.cover.publicId);
      }

      // 3. Handle Gallery Uploads & Orphan Tracking
      const currentGallery = event.gallery || [];
      const incomingGalleryUrls = (dto.gallery || []).map(g => g.url);
      
      const incomingGallery: CarouselImage[] = [];
      for (const g of dto.gallery || []) {
        const alt = g.alt ? await this.translationService.translateMissing(g.alt) : title;
        incomingGallery.push(new CarouselImage(g.url, alt, g.publicId));
      }
      
      // Upload new files
      for (const file of galleryFiles) {
        const res = await this.cloudinaryService.uploadImageWithDetails(file, 'events/gallery');
        newUploads.push(res.publicId);
        incomingGallery.push(new CarouselImage(res.url, title, res.publicId));
      }

      // Identify orphans (images present in DB but not in incoming request)
      currentGallery.forEach(img => {
        if (!incomingGalleryUrls.includes(img.url)) {
          const id = img.publicId || extractPublicIdFromUrl(img.url);
          if (id) orphanPublicIds.push(id);
        }
      });

      Object.assign(event, {
        slug: dto.slug,
        title,
        content,
        cover,
        gallery: incomingGallery,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        orderIndex: dto.orderIndex,
        seoMetadata: { ...dto.seoMetadata, title: dto.seoMetadata.title || title.ru },
      });

      // 4. Persistence
      await this.eventsRepository.save(event);

      // 5. ON SUCCESS: Orphan Cleanup
      await Promise.allSettled(orphanPublicIds.map(id => this.cloudinaryService.deleteImage(id)));
      
    } catch (error) {
      // 6. ON FAILURE: New Upload Rollback
      await Promise.allSettled(newUploads.map(id => this.cloudinaryService.deleteImage(id)));
      throw error;
    }
  }
}
