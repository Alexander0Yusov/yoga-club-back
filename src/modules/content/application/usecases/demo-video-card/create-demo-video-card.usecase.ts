import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { DemoVideoCard, DemoVideoCardDocument } from 'src/modules/content/domain/demo-video-card.entity';
import { CreateDemoVideoCardDto } from 'src/modules/content/api/dto/demo-video-card.dto';
import { CarouselImage } from 'src/modules/content/domain/carousel-image.vo';

export class CreateDemoVideoCardCommand {
  constructor(
    public readonly dto: CreateDemoVideoCardDto,
    public readonly file?: Express.Multer.File,
  ) {}
}

@CommandHandler(CreateDemoVideoCardCommand)
export class CreateDemoVideoCardUseCase implements ICommandHandler<CreateDemoVideoCardCommand> {
  constructor(
    @InjectModel(DemoVideoCard.name) private readonly model: Model<DemoVideoCardDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: CreateDemoVideoCardCommand): Promise<string> {
    const { dto, file } = command;
    const uploadedPublicIds: string[] = [];

    try {
      // 1. Translations
      const [title, description] = await Promise.all([
        this.translationService.translateMissing(dto.title),
        this.translationService.translateMissing(dto.description),
      ]);

      // 2. Image Handling
      let thumbnail: CarouselImage;
      if (file) {
        const res = await this.cloudinaryService.uploadImageWithDetails(file, 'demo-video-thumbnails');
        uploadedPublicIds.push(res.publicId);
        // Fallback alt to title
        thumbnail = new CarouselImage(res.url, title, res.publicId);
      } else {
        // Thumbnail is required in schema, so if no file, we might need a placeholder or error
        // But let's assume one is always provided for now, or use a default
        throw new Error('Thumbnail file is required for DemoVideoCard');
      }

      // 3. Assemble and Save
      const card = new this.model({
        ...dto,
        title,
        description,
        thumbnail,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      });

      await card.save();
      return card._id.toString();
    } catch (error) {
      await Promise.allSettled(uploadedPublicIds.map(id => this.cloudinaryService.deleteImage(id)));
      throw error;
    }
  }
}
