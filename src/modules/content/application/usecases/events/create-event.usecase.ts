import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { ClubEvent, ClubEventDocument } from 'src/modules/content/domain/club-event.entity';
import { LocalizedText } from 'src/modules/content/domain/localized-text.vo';
import { SeoMetadata } from 'src/core/base-domain-entity/seo-metadata.vo';
import { CarouselImage } from 'src/modules/content/domain/carousel-image.vo';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class CreateEventCommand {
  constructor(
    public readonly payload: {
      slug: string;
      title: LocalizedText;
      content: LocalizedText;
      seoMetadata: SeoMetadata;
      startDate: Date;
      endDate: Date;
      orderIndex?: number | null;
    },
    public readonly coverFile?: Express.Multer.File,
    public readonly galleryFiles: Express.Multer.File[] = [],
  ) {}
}

@CommandHandler(CreateEventCommand)
export class CreateEventUseCase implements ICommandHandler<CreateEventCommand> {
  constructor(
    @InjectModel(ClubEvent.name) private readonly eventModel: Model<ClubEventDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: CreateEventCommand): Promise<string> {
    const { payload, coverFile, galleryFiles } = command;
    const uploadedPublicIds: string[] = [];

    try {
      // 1. Check slug uniqueness
      const existing = await this.eventModel.findOne({ slug: payload.slug });
      if (existing) {
        throw new DomainException({ code: DomainExceptionCode.BadRequest, message: 'Slug already exists' });
      }

      // Translate domain text first
      const [title, content] = await Promise.all([
        this.translationService.translateMissing(payload.title),
        this.translationService.translateMissing(payload.content),
      ]);

      // 2. Upload cover
      let cover: CarouselImage | undefined;
      if (coverFile) {
        const result = await this.cloudinaryService.uploadImageWithDetails(coverFile, 'events/covers');
        cover = new CarouselImage(result.url, title, result.publicId);
        uploadedPublicIds.push(result.publicId);
      }

      // 3. Upload gallery
      const gallery: CarouselImage[] = [];
      for (const file of galleryFiles) {
        const result = await this.cloudinaryService.uploadImageWithDetails(file, 'events/gallery');
        gallery.push(new CarouselImage(result.url, title, result.publicId));
        uploadedPublicIds.push(result.publicId);
      }

      // 5. Create and save entity
      const event = new this.eventModel({
        ...payload,
        title,
        content,
        cover,
        gallery,
        seoMetadata: {
          ...payload.seoMetadata,
          title: payload.seoMetadata.title || title.ru, // Fallback mapping
        },
      });

      await event.save();
      return event._id.toString();
    } catch (error) {
      // Atomicity: Rollback uploads if anything fails
      for (const publicId of uploadedPublicIds) {
        await this.cloudinaryService.deleteImage(publicId).catch(() => null);
      }
      throw error;
    }
  }
}
