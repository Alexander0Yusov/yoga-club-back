import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateUserProfileDto } from './update-user-profile.dto';

export class UpdateUserProfileApiDto extends UpdateUserProfileDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'User avatar image (jpg, jpeg, png, webp, max 2MB)',
  })
  avatar?: any;
}
