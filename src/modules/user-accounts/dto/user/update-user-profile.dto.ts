import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import { IsBooleanLike } from '../../../../core/decorators/validation/is-boolean-like';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description: 'Updated user name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 40,
  })
  @IsOptional()
  @IsString()
  @Trim()
  name?: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+380991234567',
  })
  @IsOptional()
  @IsString()
  @Trim()
  telephone?: string;

  @ApiPropertyOptional({
    description: 'Subscription status for marketing emails',
    example: true,
  })
  @IsOptional()
  @IsBooleanLike()
  isSubscribed?: boolean;
}
