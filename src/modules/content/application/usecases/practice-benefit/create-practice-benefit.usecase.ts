import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { PracticeBenefit, PracticeBenefitDocument } from 'src/modules/content/domain/practice-benefit.entity';
import { CreatePracticeBenefitDto } from 'src/modules/content/api/dto/practice-benefit.dto';
import { CarouselImage } from 'src/modules/content/domain/carousel-image.vo';

export class CreatePracticeBenefitCommand {
  constructor(
    public readonly dto: CreatePracticeBenefitDto,
    public readonly file?: Express.Multer.File,
  ) {}
}

@CommandHandler(CreatePracticeBenefitCommand)
export class CreatePracticeBenefitUseCase implements ICommandHandler<CreatePracticeBenefitCommand> {
  constructor(
    @InjectModel(PracticeBenefit.name) private readonly model: Model<PracticeBenefitDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: CreatePracticeBenefitCommand): Promise<string> {
    const { dto, file } = command;
    const uploadedPublicIds: string[] = [];

    try {
      // 1. Translations (loop through 10 fields)
      const translatedTexts: Record<string, any> = {};
      const translationPromises: Promise<any>[] = [];

      for (let i = 1; i <= 10; i++) {
        const fieldKey = `text_${i}`;
        const val = (dto as any)[fieldKey];
        if (val && Object.keys(val).length > 0) {
          translationPromises.push(
            this.translationService.translateMissing(val).then(res => {
              translatedTexts[fieldKey] = res;
            })
          );
        }
      }
      await Promise.all(translationPromises);

      // 2. Image Handling
      let image: CarouselImage | undefined;
      if (file) {
        const res = await this.cloudinaryService.uploadImageWithDetails(file, 'practice-benefits');
        uploadedPublicIds.push(res.publicId);
        // Fallback alt to text_1 (benefit title/primary text)
        image = new CarouselImage(res.url, translatedTexts['text_1'] || (dto as any).text_1, res.publicId);
      }

      // 3. Assemble and Save
      const benefit = new this.model({
        ...translatedTexts,
        image,
      });

      await benefit.save();
      return benefit._id.toString();
    } catch (error) {
      await Promise.allSettled(uploadedPublicIds.map(id => this.cloudinaryService.deleteImage(id)));
      throw error;
    }
  }
}
