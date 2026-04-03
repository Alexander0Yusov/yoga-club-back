import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { Section, SectionDocument } from 'src/modules/content/domain/section.entity';
import { CreateSectionDto } from 'src/modules/content/api/dto/section.dto';

export class CreateSectionCommand {
  constructor(public readonly dto: CreateSectionDto) {}
}

@CommandHandler(CreateSectionCommand)
export class CreateSectionUseCase implements ICommandHandler<CreateSectionCommand> {
  constructor(
    @InjectModel(Section.name) private readonly model: Model<SectionDocument>,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: CreateSectionCommand): Promise<string> {
    const { dto } = command;

    const [title, subtitle_1, subtitle_2] = await Promise.all([
      this.translationService.translateMissing(dto.title),
      dto.subtitle_1 ? this.translationService.translateMissing(dto.subtitle_1) : undefined,
      dto.subtitle_2 ? this.translationService.translateMissing(dto.subtitle_2) : undefined,
    ]);

    const section = new this.model({
      ...dto,
      title,
      subtitle_1,
      subtitle_2,
    });

    await section.save();
    return section._id.toString();
  }
}
