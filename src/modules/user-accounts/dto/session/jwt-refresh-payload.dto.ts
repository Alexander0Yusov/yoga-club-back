import { Language } from '../../domain/user/user.entity';

export type JwtRefreshPayload = {
  id: string;
  deviceId: string;
  lang: Language;
  isLanguageManual: boolean;
  iat: number;
  exp: number;
};
