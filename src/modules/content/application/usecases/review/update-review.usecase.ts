import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { ReviewRepository } from 'src/modules/content/infrastructure/review.repository';
import { UpdateReviewDto } from 'src/modules/content/api/dto/review.dto';

export class UpdateReviewCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateReviewDto,
  ) {}
}

@CommandHandler(UpdateReviewCommand)
export class UpdateReviewUseCase implements ICommandHandler<UpdateReviewCommand> {
  constructor(
    private readonly repository: ReviewRepository,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: UpdateReviewCommand): Promise<void> {
    const { id, dto } = command;
    const review = await this.repository.getByIdOrNotFoundFail(id);

    // If original text updated, translate others
    let text = review.text;
    if (dto.text) {
      const sourceLang = dto.originalLanguage || review.originalLanguage;
      text = await this.translationService.translateMissing(dto.text, sourceLang as any);
    }

    Object.assign(review, {
      ...dto,
      text,
    });

    await this.repository.save(review);
  }
}
