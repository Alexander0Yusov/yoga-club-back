import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { Advantage, AdvantageDocument } from 'src/modules/content/domain/advantage.entity';
import { CreateAdvantageDto } from 'src/modules/content/api/dto/advantage.dto';
import { CarouselImage } from 'src/modules/content/domain/carousel-image.vo';

export class CreateAdvantageCommand {
  constructor(
    public readonly dto: CreateAdvantageDto,
    public readonly file?: Express.Multer.File,
  ) {}
}

@CommandHandler(CreateAdvantageCommand)
export class CreateAdvantageUseCase implements ICommandHandler<CreateAdvantageCommand> {
  constructor(
    @InjectModel(Advantage.name) private readonly model: Model<AdvantageDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: CreateAdvantageCommand): Promise<string> {
    const { dto, file } = command;
    const uploadedPublicIds: string[] = [];

    try {
      // 1. Translations
      const [title, text] = await Promise.all([
        this.translationService.translateMissing(dto.title),
        this.translationService.translateMissing(dto.text),
      ]);

      // 2. Image Handling
      let image: CarouselImage | undefined;
      if (file) {
        const res = await this.cloudinaryService.uploadImageWithDetails(file, 'advantages');
        uploadedPublicIds.push(res.publicId);
        // Fallback alt to title
        image = new CarouselImage(res.url, title, res.publicId);
      }

      // 3. Assemble and Save
      const advantage = new this.model({
        title,
        text,
        image,
        orderIndex: dto.orderIndex,
      });

      await advantage.save();
      return advantage._id.toString();
    } catch (error) {
      await Promise.allSettled(uploadedPublicIds.map(id => this.cloudinaryService.deleteImage(id)));
      throw error;
    }
  }
}
