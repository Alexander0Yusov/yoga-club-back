import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import { Transform } from 'class-transformer';
import { Language } from '../../domain/user/user.entity';

export class UpdateUserProfileDto {
  @ApiProperty({
    description: 'Updated user name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 40,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Trim()
  name?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+380991234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Trim()
  telephone?: string;

  @ApiProperty({
    description: 'Subscription status for marketing emails',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSubscribed?: boolean;

  @ApiProperty({
    enum: Language,
    required: false,
    description: 'Explicit language override (set to "" or null to reset to auto)',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsEnum(Language)
  lang?: Language | null;
}
