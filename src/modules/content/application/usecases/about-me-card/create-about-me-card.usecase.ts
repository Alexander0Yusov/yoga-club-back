import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { AboutMeCard, AboutMeCardDocument } from 'src/modules/content/domain/about-me-card.entity';
import { CreateAboutMeCardDto, CardBlockDto } from 'src/modules/content/api/dto/about-me-card.dto';
import { CarouselImage } from 'src/modules/content/domain/carousel-image.vo';

export class CreateAboutMeCardCommand {
  constructor(
    public readonly dto: CreateAboutMeCardDto,
    public readonly leftFile?: Express.Multer.File,
    public readonly rightFile?: Express.Multer.File,
  ) {}
}

@CommandHandler(CreateAboutMeCardCommand)
export class CreateAboutMeCardUseCase implements ICommandHandler<CreateAboutMeCardCommand> {
  constructor(
    @InjectModel(AboutMeCard.name) private readonly model: Model<AboutMeCardDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly translationService: ITranslationService,
  ) {}

  private async processBlockTrans(block?: CardBlockDto) {
    if (!block) return undefined;
    const [title, text] = await Promise.all([
      block.title && Object.keys(block.title).length ? this.translationService.translateMissing(block.title) : undefined,
      block.text && Object.keys(block.text).length ? this.translationService.translateMissing(block.text) : undefined,
    ]);
    return { ...block, title, text };
  }

  async execute(command: CreateAboutMeCardCommand): Promise<string> {
    const { dto, leftFile, rightFile } = command;
    const uploadedPublicIds: string[] = [];

    try {
      const [leftTranslated, rightTranslated] = await Promise.all([
        this.processBlockTrans(dto.left),
        this.processBlockTrans(dto.right),
      ]);

      let leftImage: CarouselImage | undefined;
      let rightImage: CarouselImage | undefined;

      if (leftFile || leftTranslated?.image) {
        let alt = leftTranslated?.title;
        if (leftTranslated?.image?.alt && Object.keys(leftTranslated.image.alt).length) {
           alt = await this.translationService.translateMissing(leftTranslated.image.alt);
        }
        
        if (leftFile) {
          const res = await this.cloudinaryService.uploadImageWithDetails(leftFile, 'about-me');
          uploadedPublicIds.push(res.publicId);
          leftImage = new CarouselImage(res.url, alt, res.publicId);
        } else if (leftTranslated?.image) {
          leftImage = new CarouselImage(leftTranslated.image.url, alt, leftTranslated.image.publicId);
        }
      }

      if (rightFile || rightTranslated?.image) {
        let alt = rightTranslated?.title;
        if (rightTranslated?.image?.alt && Object.keys(rightTranslated.image.alt).length) {
           alt = await this.translationService.translateMissing(rightTranslated.image.alt);
        }
        
        if (rightFile) {
          const res = await this.cloudinaryService.uploadImageWithDetails(rightFile, 'about-me');
          uploadedPublicIds.push(res.publicId);
          rightImage = new CarouselImage(res.url, alt, res.publicId);
        } else if (rightTranslated?.image) {
          rightImage = new CarouselImage(rightTranslated.image.url, alt, rightTranslated.image.publicId);
        }
      }

      const card = new this.model({
        orderIndex: dto.orderIndex,
        left: leftTranslated ? { ...leftTranslated, image: leftImage } : undefined,
        right: rightTranslated ? { ...rightTranslated, image: rightImage } : undefined,
      });

      await card.save();
      return card._id.toString();
    } catch (error) {
      await Promise.allSettled(uploadedPublicIds.map(id => this.cloudinaryService.deleteImage(id)));
      throw error;
    }
  }
}
