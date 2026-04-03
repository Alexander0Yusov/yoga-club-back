import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReviewRepository } from 'src/modules/content/infrastructure/review.repository';

export class DeleteReviewCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteReviewCommand)
export class DeleteReviewUseCase implements ICommandHandler<DeleteReviewCommand> {
  constructor(
    private readonly repository: ReviewRepository,
  ) {}

  async execute(command: DeleteReviewCommand): Promise<void> {
    const review = await this.repository.getByIdOrNotFoundFail(command.id);

    review.softDelete();

    await this.repository.save(review);
  }
}
