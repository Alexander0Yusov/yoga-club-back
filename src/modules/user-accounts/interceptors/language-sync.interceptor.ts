import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response, Request } from 'express';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { UsersService } from '../application/users.service';
import { Language } from '../domain/user/user.entity';

@Injectable()
export class LanguageSyncInterceptor implements NestInterceptor {
  constructor(private readonly usersService: UsersService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const user = req.user as UserContextDto;

    // Fast exit: if signed cookie exists or no authenticated user
    if (req.signedCookies?.lang_synced || !user) return next.handle();

    const detectedLang = this.parseLanguage(req);
    const whitelist: Language[] = [Language.RU, Language.EN, Language.UK, Language.DE];

    if (detectedLang && whitelist.includes(detectedLang as Language)) {
      if (detectedLang !== user.lang && !user.isLanguageManual) {
        // Fire-and-forget sync
        this.usersService.updateLanguage(user.id, detectedLang as Language).catch(() => null);
      }
    }

    // Set signed cookie for 24h to prevent redundant checks
    res.cookie('lang_synced', 'true', {
      maxAge: 86400000,
      signed: true,
      httpOnly: true,
      secure: true,
    });

    return next.handle();
  }

  private parseLanguage(req: Request): string | null {
    const header = (req.headers['x-client-lang'] as string) || (req.headers['accept-language'] as string);
    if (!header) return null;
    const match = header.match(/^([a-z]{2})/i);
    return match ? match[1].toLowerCase() : null;
  }
}
