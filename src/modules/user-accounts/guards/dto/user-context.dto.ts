import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { Language } from '../../domain/user/user.entity';

/**
 * user object for the jwt token and for transfer from the request object
 */
export class UserContextDto {
  @IsString()
  id: string;

  @IsEnum(Language)
  lang: Language;

  @IsBoolean()
  isLanguageManual: boolean;
}

export type Nullable<T> = { [P in keyof T]: T[P] | null };
