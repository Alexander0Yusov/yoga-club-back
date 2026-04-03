import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventRefsPanel, EventRefsPanelDocument } from 'src/modules/content/domain/event-refs-panel.entity';
import { CreateEventRefsPanelDto } from 'src/modules/content/api/dto/event-refs-panel.dto';
import { CloudinaryService } from 'src/modules/media/application/cloudinary.service';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

export class CreateEventRefsPanelCommand {
  constructor(
    public readonly dto: CreateEventRefsPanelDto,
    public readonly files: {
      leftRefImage?: Express.Multer.File;
      rightRefImage?: Express.Multer.File;
    },
  ) {}
}

@CommandHandler(CreateEventRefsPanelCommand)
export class CreateEventRefsPanelUseCase implements ICommandHandler<CreateEventRefsPanelCommand> {
  constructor(
    @InjectModel(EventRefsPanel.name) private readonly model: Model<EventRefsPanelDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(command: CreateEventRefsPanelCommand): Promise<string> {
    const { dto, files } = command;

    // Singleton check
    const existing = await this.model.findOne({ deletedAt: null });
    if (existing) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'EventRefsPanel already exists. Use update instead.',
      });
    }

    if (!files.leftRefImage || !files.rightRefImage) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Both left and right ref images are required for creation.',
      });
    }

    // Upload images
    const [leftUploaded, rightUploaded] = await Promise.all([
      this.cloudinaryService.uploadImageWithDetails(files.leftRefImage, 'event-refs'),
      this.cloudinaryService.uploadImageWithDetails(files.rightRefImage, 'event-refs'),
    ]);

    const panel = new this.model({
      leftRefImage: {
        url: leftUploaded.url,
        publicId: leftUploaded.publicId,
        alt: dto.leftRefImage?.alt,
      },
      rightRefImage: {
        url: rightUploaded.url,
        publicId: rightUploaded.publicId,
        alt: dto.rightRefImage?.alt,
      },
    });

    await panel.save();
    return panel._id.toString();
  }
}
