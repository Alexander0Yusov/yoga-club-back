import { IsEmail, IsString, Length } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import {
  passwordConstraints,
} from '../../domain/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserInputDto {
  @ApiProperty({
    example: 'qwerty',
    minLength: passwordConstraints.minLength,
    maxLength: passwordConstraints.maxLength,
  })
  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  password: string;

  @ApiProperty({ example: 'user@mail.com' })
  @IsString()
  @IsEmail()
  @Trim()
  email: string;
}
