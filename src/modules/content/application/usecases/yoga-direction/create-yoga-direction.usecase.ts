import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { YogaDirection, YogaDirectionDocument } from 'src/modules/content/domain/yoga-direction.entity';
import { CreateYogaDirectionDto } from 'src/modules/content/api/dto/yoga-direction.dto';
import { CarouselImage } from 'src/modules/content/domain/carousel-image.vo';

export class CreateYogaDirectionCommand {
  constructor(
    public readonly dto: CreateYogaDirectionDto,
    public readonly file?: Express.Multer.File,
  ) {}
}

@CommandHandler(CreateYogaDirectionCommand)
export class CreateYogaDirectionUseCase implements ICommandHandler<CreateYogaDirectionCommand> {
  constructor(
    @InjectModel(YogaDirection.name) private readonly model: Model<YogaDirectionDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: CreateYogaDirectionCommand): Promise<string> {
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
        const res = await this.cloudinaryService.uploadImageWithDetails(file, 'yoga-directions');
        uploadedPublicIds.push(res.publicId);
        // Fallback alt to title
        image = new CarouselImage(res.url, title, res.publicId);
      }

      // 3. Assemble and Save
      const direction = new this.model({
        title,
        text,
        image,
        orderIndex: dto.orderIndex,
      });

      await direction.save();
      return direction._id.toString();
    } catch (error) {
      await Promise.allSettled(uploadedPublicIds.map(id => this.cloudinaryService.deleteImage(id)));
      throw error;
    }
  }
}
