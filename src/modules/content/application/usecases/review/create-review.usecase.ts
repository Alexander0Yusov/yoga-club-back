import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITranslationService } from 'src/modules/content/infrastructure/translation.service';
import { Review, ReviewDocument } from 'src/modules/content/domain/review.entity';
import { CreateReviewDto } from 'src/modules/content/api/dto/review.dto';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class CreateReviewCommand {
  constructor(public readonly dto: CreateReviewDto) {}
}

@CommandHandler(CreateReviewCommand)
export class CreateReviewUseCase implements ICommandHandler<CreateReviewCommand> {
  constructor(
    @InjectModel(Review.name) private readonly model: Model<ReviewDocument>,
    private readonly translationService: ITranslationService,
  ) {}

  async execute(command: CreateReviewCommand): Promise<string> {
    const { dto } = command;

    // validation: ensure the frontend provided text exactly for the originalLanguage
    const originalText = dto.text[dto.originalLanguage];
    if (!originalText) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Review text must be provided in the specified original language: ${dto.originalLanguage}`,
      });
    }

    // translations: translate FROM originalLanguage to others
    const translatedText = await this.translationService.translateMissing(dto.text, dto.originalLanguage as any);

    const review = new this.model({
      ...dto,
      text: translatedText,
    });

    await review.save();
    return review._id.toString();
  }
}
