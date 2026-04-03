import { ApiProperty, OmitType } from '@nestjs/swagger';
import { User, UserDocument, Language, Role } from '../../domain/user/user.entity';

export class UserViewDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'john_doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: '2026-02-26T14:10:00.000Z' })
  createdAt: Date;

  static mapToView(user: User) {
    const dto = new UserViewDto();

    dto.id = String(user.id);
    dto.email = user.email;
    dto.name = user.name;
    dto.createdAt = user.createdAt;

    return dto;
  }
}

//https://docs.nestjs.com/openapi/mapped-types
export class MeViewDto extends OmitType(UserViewDto, [
  'createdAt',
  'id',
] as const) {
  @ApiProperty({ example: '1' })
  userId: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/...' })
  imgUrl: string;

  @ApiProperty({ example: '+380991234567' })
  telephone: string;

  @ApiProperty({ example: true })
  isSubscribed: boolean;

  @ApiProperty({ enum: Language, example: Language.EN })
  lang: Language;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;

  @ApiProperty({
    description: 'Linked auth identities with provider avatars',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        provider: { type: 'string', example: 'google' },
        providerAvatarUrl: {
          type: 'string',
          example: 'https://lh3.googleusercontent.com/a/...',
        },
        providerName: { type: 'string', example: 'Google' },
      },
    },
  })
  linkedIdentities?: {
    provider: string;
    providerAvatarUrl?: string;
    providerName?: string;
  }[];

  static mapToView(user: UserDocument): MeViewDto {
    const dto = new MeViewDto();

    dto.email = user.email;
    dto.name = user.name;
    dto.userId = user._id.toString();
    dto.imgUrl = user.imgUrl || '';
    dto.telephone = user.telephone || '';
    dto.isSubscribed = user.isSubscribed;
    dto.lang = user.lang;
    dto.role = user.role;
    dto.linkedIdentities = (user.linkedIdentities || []).map((identity) => ({
      provider: identity.provider,
      providerAvatarUrl: identity.providerAvatarUrl,
      providerName: identity.providerName,
    }));

    return dto;
  }
}

export class UserProfileUpdateViewDto {
  @ApiProperty({
    description: 'Updated user professional name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Avatar image URL (from Cloudinary)',
    example: 'https://res.cloudinary.com/demo/image/upload/v123/avatar.jpg',
  })
  imgUrl: string;

  @ApiProperty({
    description: 'Formatted phone number',
    example: '+380991234567',
  })
  telephone: string;

  @ApiProperty({
    description: 'Current marketing subscription status',
    example: true,
  })
  isSubscribed: boolean;

  static mapToView(user: UserDocument): UserProfileUpdateViewDto {
    const dto = new UserProfileUpdateViewDto();
    dto.name = user.name;
    dto.imgUrl = user.imgUrl || '';
    dto.telephone = user.telephone || '';
    dto.isSubscribed = user.isSubscribed;
    return dto;
  }
}
