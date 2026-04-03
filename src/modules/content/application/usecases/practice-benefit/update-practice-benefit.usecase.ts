import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { PracticeBenefitRepository } from 'src/modules/content/infrastructure/practice-benefit.repository';
import { UpdatePracticeBenefitDto } from 'src/modules/content/api/dto/practice-benefit.dto';
import { CarouselImage } from 'src/modules/content/domain/carousel-image.vo';
import { extractPublicIdFromUrl } from 'src/modules/media/utils/cloudinary-url.util';

export class UpdatePracticeBenefitCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdatePracticeBenefitDto,
    public readonly file?: Express.Multer.File,
  ) {}
}

@CommandHandler(UpdatePracticeBenefitCommand)
export class UpdatePracticeBenefitUseCase implements ICommandHandler<UpdatePracticeBenefitCommand> {
  constructor(
    private readonly repository: PracticeBenefitRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: UpdatePracticeBenefitCommand): Promise<void> {
    const { id, dto, file } = command;
    const benefit = await this.repository.getByIdOrNotFoundFail(id);
    
    const newUploads: string[] = [];
    const orphanPublicIds: string[] = [];

    try {
      // 1. Collect old publicId for potential cleanup
      if (benefit.image?.publicId) {
        orphanPublicIds.push(benefit.image.publicId);
      } else if (benefit.image?.url) {
        const id = extractPublicIdFromUrl(benefit.image.url);
        if (id) orphanPublicIds.push(id);
      }

      // 2. Translations (loop through 10 fields)
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

      // 3. Image Update
      let image = benefit.image;
      if (file) {
        const res = await this.cloudinaryService.uploadImageWithDetails(file, 'practice-benefits');
        newUploads.push(res.publicId);
        // Fallback alt to text_1 (benefit title/primary text)
        const alt = translatedTexts['text_1'] || benefit.text_1;
        image = new CarouselImage(res.url, alt, res.publicId);
      } else if (dto.image) {
        // If only JSON data updated (e.g. alt changed)
        const alt = dto.image.alt ? await this.translationService.translateMissing(dto.image.alt) : (translatedTexts['text_1'] || benefit.text_1);
        image = new CarouselImage(dto.image.url, alt, dto.image.publicId);
        
        // If the URL hasn't changed, we don't want to delete the old image
        const keptId = image.publicId || extractPublicIdFromUrl(image.url);
        const idx = orphanPublicIds.indexOf(keptId || 'none');
        if (idx > -1) orphanPublicIds.splice(idx, 1);
      }

      // 4. Update and Save
      Object.assign(benefit, {
        ...translatedTexts,
        image,
      });

      await this.repository.save(benefit);

      // 5. Cleanup Old Assets
      await Promise.allSettled(orphanPublicIds.map(id => this.cloudinaryService.deleteImage(id)));
    } catch (error) {
      // Rollback New Uploads
      await Promise.allSettled(newUploads.map(id => this.cloudinaryService.deleteImage(id)));
      throw error;
    }
  }
}
