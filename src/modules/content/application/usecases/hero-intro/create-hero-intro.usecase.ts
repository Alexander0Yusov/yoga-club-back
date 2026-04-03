import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { HeroIntro, HeroIntroDocument } from 'src/modules/content/domain/hero-intro.entity';
import { CreateHeroIntroDto } from 'src/modules/content/api/dto/hero-intro.dto';
import { CarouselImage } from 'src/modules/content/domain/carousel-image.vo';

export class CreateHeroIntroCommand {
  constructor(
    public readonly dto: CreateHeroIntroDto,
    public readonly file?: Express.Multer.File,
  ) {}
}

@CommandHandler(CreateHeroIntroCommand)
export class CreateHeroIntroUseCase implements ICommandHandler<CreateHeroIntroCommand> {
  constructor(
    @InjectModel(HeroIntro.name) private readonly model: Model<HeroIntroDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: CreateHeroIntroCommand): Promise<string> {
    const { dto, file } = command;
    const uploadedPublicIds: string[] = [];

    try {
      // 1. Translations
      const [title, text1, text2] = await Promise.all([
        this.translationService.translateMissing(dto.title),
        this.translationService.translateMissing(dto.text1),
        this.translationService.translateMissing(dto.text2),
      ]);

      // 2. Image Handling
      let image: CarouselImage | undefined;
      if (file) {
        const res = await this.cloudinaryService.uploadImageWithDetails(file, 'hero-intro');
        uploadedPublicIds.push(res.publicId);
        // Fallback alt to title
        image = new CarouselImage(res.url, title, res.publicId);
      }

      // 3. Assemble and Save
      const heroIntro = new this.model({
        title,
        text1,
        text2,
        image,
      });

      await heroIntro.save();
      return heroIntro._id.toString();
    } catch (error) {
      // Rollback
      await Promise.allSettled(uploadedPublicIds.map(id => this.cloudinaryService.deleteImage(id)));
      throw error;
    }
  }
}
