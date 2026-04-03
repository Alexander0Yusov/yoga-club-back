import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { Language } from '../../domain/user/user.entity';

export class DeviceContextDto {
  @IsString()
  id: string;

  @IsString()
  deviceId: string;

  @IsEnum(Language)
  lang: Language;

  @IsBoolean()
  isLanguageManual: boolean;
}
