import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from '../../domain/user/user.entity';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { Optional } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserInputDto {
  @ApiPropertyOptional({
    example: 'john_doe',
    minLength: loginConstraints.minLength,
    maxLength: loginConstraints.maxLength,
  })
  @Optional()
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  name: string;

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
