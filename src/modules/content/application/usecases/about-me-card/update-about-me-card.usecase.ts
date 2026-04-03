import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { AboutMeCardRepository } from 'src/modules/content/infrastructure/about-me-card.repository';
import { UpdateAboutMeCardDto, CardBlockDto } from 'src/modules/content/api/dto/about-me-card.dto';
import { extractPublicIdFromUrl } from 'src/modules/media/utils/cloudinary-url.util';
import { CarouselImage } from 'src/modules/content/domain/carousel-image.vo';

export class UpdateAboutMeCardCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateAboutMeCardDto,
    public readonly leftFile?: Express.Multer.File,
    public readonly rightFile?: Express.Multer.File,
  ) {}
}

@CommandHandler(UpdateAboutMeCardCommand)
export class UpdateAboutMeCardUseCase implements ICommandHandler<UpdateAboutMeCardCommand> {
  constructor(
    private readonly repository: AboutMeCardRepository,
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

  async execute(command: UpdateAboutMeCardCommand): Promise<void> {
    const { id, dto, leftFile, rightFile } = command;
    const card = await this.repository.getByIdOrNotFoundFail(id);
    
    const newUploads: string[] = [];
    const orphanPublicIds: string[] = [];

    try {
      if (card.left?.image?.publicId) orphanPublicIds.push(card.left.image.publicId);
      else if (card.left?.image?.url) {
        const oldId = extractPublicIdFromUrl(card.left.image.url);
        if (oldId) orphanPublicIds.push(oldId);
      }

      if (card.right?.image?.publicId) orphanPublicIds.push(card.right.image.publicId);
      else if (card.right?.image?.url) {
        const oldId = extractPublicIdFromUrl(card.right.image.url);
        if (oldId) orphanPublicIds.push(oldId);
      }

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
          newUploads.push(res.publicId);
          leftImage = new CarouselImage(res.url, alt, res.publicId);
        } else if (leftTranslated?.image) {
          leftImage = new CarouselImage(leftTranslated.image.url, alt, leftTranslated.image.publicId);
          if (leftImage.publicId) {
            const index = orphanPublicIds.indexOf(leftImage.publicId);
            if (index > -1) orphanPublicIds.splice(index, 1);
          } else {
            const urlId = extractPublicIdFromUrl(leftImage.url);
            if (urlId) {
              const idx = orphanPublicIds.indexOf(urlId);
              if (idx > -1) orphanPublicIds.splice(idx, 1);
            }
          }
        }
      }

      if (rightFile || rightTranslated?.image) {
        let alt = rightTranslated?.title;
        if (rightTranslated?.image?.alt && Object.keys(rightTranslated.image.alt).length) {
           alt = await this.translationService.translateMissing(rightTranslated.image.alt);
        }
        
        if (rightFile) {
          const res = await this.cloudinaryService.uploadImageWithDetails(rightFile, 'about-me');
          newUploads.push(res.publicId);
          rightImage = new CarouselImage(res.url, alt, res.publicId);
        } else if (rightTranslated?.image) {
          rightImage = new CarouselImage(rightTranslated.image.url, alt, rightTranslated.image.publicId);
          if (rightImage.publicId) {
            const index = orphanPublicIds.indexOf(rightImage.publicId);
            if (index > -1) orphanPublicIds.splice(index, 1);
          } else {
            const urlId = extractPublicIdFromUrl(rightImage.url);
            if (urlId) {
              const idx = orphanPublicIds.indexOf(urlId);
              if (idx > -1) orphanPublicIds.splice(idx, 1);
            }
          }
        }
      }

      card.orderIndex = dto.orderIndex;
      card.left = leftTranslated ? { ...leftTranslated, image: leftImage } : undefined;
      card.right = rightTranslated ? { ...rightTranslated, image: rightImage } : undefined;

      if (!card.left) card.left = undefined;
      if (!card.right) card.right = undefined;

      await this.repository.save(card);

      const validOrphans = orphanPublicIds.filter(Boolean);
      await Promise.allSettled(validOrphans.map(id => this.cloudinaryService.deleteImage(id)));

    } catch (error) {
      await Promise.allSettled(newUploads.map(id => this.cloudinaryService.deleteImage(id)));
      throw error;
    }
  }
}
