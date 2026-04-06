import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CloudinaryService } from '../../../../media/application/cloudinary.service';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { extractPublicIdFromUrl } from '../../../../media/utils/cloudinary-url.util';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Language } from '../../../domain/user/user.entity';

export class UpdateUserProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly name?: string,
    public readonly telephone?: string,
    public readonly avatarFile?: Express.Multer.File,
    public readonly isSubscribed?: boolean,
    public readonly lang?: Language | null,
  ) {}
}

@CommandHandler(UpdateUserProfileCommand)
export class UpdateUserProfileUseCase
  implements ICommandHandler<UpdateUserProfileCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(command: UpdateUserProfileCommand): Promise<void> {
    const { userId, name, telephone, avatarFile, isSubscribed, lang } = command;
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    let avatarUrl = user.imgUrl;

    if (avatarFile) {
      const oldPublicId = extractPublicIdFromUrl(user.imgUrl);
      if (oldPublicId) {
        await this.cloudinaryService.deleteImage(oldPublicId).catch(() => null);
      }

      avatarUrl = await this.cloudinaryService.uploadImage(avatarFile, 'avatars');
      avatarUrl = avatarUrl.replace(
        '/upload/',
        '/upload/w_256,h_256,c_fill,g_face,f_auto,q_auto,dpr_auto/',
      );
    }

    user.updateProfile(name, telephone, avatarUrl, isSubscribed, lang);
    await this.usersRepository.save(user);
  }
}
