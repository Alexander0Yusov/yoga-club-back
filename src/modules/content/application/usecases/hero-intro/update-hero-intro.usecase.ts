import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { HeroIntroRepository } from 'src/modules/content/infrastructure/hero-intro.repository';
import { UpdateHeroIntroDto } from 'src/modules/content/api/dto/hero-intro.dto';
import { CarouselImage } from 'src/modules/content/domain/carousel-image.vo';
import { extractPublicIdFromUrl } from 'src/modules/media/utils/cloudinary-url.util';

export class UpdateHeroIntroCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateHeroIntroDto,
    public readonly file?: Express.Multer.File,
  ) {}
}

@CommandHandler(UpdateHeroIntroCommand)
export class UpdateHeroIntroUseCase implements ICommandHandler<UpdateHeroIntroCommand> {
  constructor(
    private readonly repository: HeroIntroRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: UpdateHeroIntroCommand): Promise<void> {
    const { id, dto, file } = command;
    const heroIntro = await this.repository.getByIdOrNotFoundFail(id);
    
    const newUploads: string[] = [];
    const orphanPublicIds: string[] = [];

    try {
      // 1. Collect old publicId for potential cleanup
      if (heroIntro.image?.publicId) {
        orphanPublicIds.push(heroIntro.image.publicId);
      } else if (heroIntro.image?.url) {
        const id = extractPublicIdFromUrl(heroIntro.image.url);
        if (id) orphanPublicIds.push(id);
      }

      // 2. Failsafe Translations
      const translate = async (vo: any) => {
        try {
          return await this.translationService.translateMissing(vo);
        } catch (error) {
          return vo; // Fallback to provided data
        }
      };

      const [title, text1, text2] = await Promise.all([
        dto.title ? translate(dto.title) : undefined,
        dto.text1 ? translate(dto.text1) : undefined,
        dto.text2 ? translate(dto.text2) : undefined,
      ]);

      // 3. Image Update
      let image = heroIntro.image;
      if (file) {
        const res = await this.cloudinaryService.uploadImageWithDetails(file, 'hero-intro');
        newUploads.push(res.publicId);
        // Fallback alt to title (prefer updated title, then existing title)
        const alt = title || heroIntro.title;
        image = new CarouselImage(res.url, alt, res.publicId);
      } else if (dto.image) {
        // If only JSON data updated (e.g. alt changed)
        const alt = dto.image.alt ? await translate(dto.image.alt) : (title || heroIntro.title);
        image = new CarouselImage(dto.image.url, alt, dto.image.publicId);
        
        // If the URL hasn't changed, we don't want to delete the old image
        const keptId = image.publicId || extractPublicIdFromUrl(image.url);
        const idx = orphanPublicIds.indexOf(keptId || 'none');
        if (idx > -1) orphanPublicIds.splice(idx, 1);
      }

      // 4. Update and Save
      Object.assign(heroIntro, {
        ...(title && { title }),
        ...(text1 && { text1 }),
        ...(text2 && { text2 }),
        image,
      });

      await this.repository.save(heroIntro);

      // 5. Cleanup Old Assets
      await Promise.allSettled(orphanPublicIds.map(id => this.cloudinaryService.deleteImage(id)));
    } catch (error) {
      // Rollback New Uploads only
      await Promise.allSettled(newUploads.map(id => this.cloudinaryService.deleteImage(id)));
      throw error;
    }
  }
}
