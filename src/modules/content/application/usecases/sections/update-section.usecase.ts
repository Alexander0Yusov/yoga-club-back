import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { SectionsRepository } from 'src/modules/content/infrastructure/sections.repository';
import { UpdateSectionDto } from 'src/modules/content/api/dto/section.dto';

export class UpdateSectionCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateSectionDto,
  ) {}
}

@CommandHandler(UpdateSectionCommand)
export class UpdateSectionUseCase implements ICommandHandler<UpdateSectionCommand> {
  constructor(
    private readonly repository: SectionsRepository,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: UpdateSectionCommand): Promise<void> {
    const { id, dto } = command;
    const section = await this.repository.getByIdOrNotFoundFail(id);

    const [title, subtitle_1, subtitle_2] = await Promise.all([
      dto.title ? this.translationService.translateMissing(dto.title) : section.title,
      dto.subtitle_1 ? this.translationService.translateMissing(dto.subtitle_1) : section.subtitle_1,
      dto.subtitle_2 ? this.translationService.translateMissing(dto.subtitle_2) : section.subtitle_2,
    ]);

    Object.assign(section, {
      ...dto,
      title,
      subtitle_1,
      subtitle_2,
    });

    await this.repository.save(section);
  }
}
