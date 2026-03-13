import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from '../../domain/user/user.entity';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { Optional } from '@nestjs/common';

export class UserInputDto {
  @Optional()
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  name: string;

  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  @Trim()
  password: string;

  @IsString()
  @IsEmail()
  @Trim()
  email: string;
}
