import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import type { Response, Request } from 'express';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { UsersService } from '../application/users.service';
import { Language } from '../domain/user/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';

@Injectable()
export class LanguageSyncInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LanguageSyncInterceptor.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const user = req.user as UserContextDto;

    return from(this.handleSync(req, res, user)).pipe(
      switchMap(() => next.handle()),
    );
  }

  private async handleSync(
    req: Request,
    res: Response,
    user: UserContextDto,
  ): Promise<void> {
    const currentCookie = req.signedCookies?.lang_synced;
    const detectedLang = this.parseLanguage(req);
    const whitelist: Language[] = [
      Language.RU,
      Language.EN,
      Language.UK,
      Language.DE,
    ];

    if (
      !user ||
      !detectedLang ||
      !whitelist.includes(detectedLang as Language)
    ) {
      return;
    }

    let isManual = user.isLanguageManual;
    let effectiveLang = user.lang;

    // STALE TOKEN CHECK: If cookie differs from token, we might have a stale JWT.
    // We check the DB to get the absolute source of truth.
    if (currentCookie && currentCookie !== user.lang) {
      this.logger.debug(
        `Stale token or manual update detected for user ${user.id}. Cookie: ${currentCookie}, Token: ${user.lang}. Fetching fresh state from DB.`,
      );
      const dbUser = await this.usersRepository.findById(user.id);
      if (dbUser) {
        isManual = dbUser.isLanguageManual;
        effectiveLang = dbUser.lang;
        // Optionally update the request object so subsequent guards/logic see the fresh data
        user.isLanguageManual = isManual;
        user.lang = effectiveLang;
      }
    }

    // HARD LOCK: If manual choice is active, enforce it and exit.
    if (isManual) {
      this.logger.debug(
        `Silent sync skipped for user ${user.id}: Manual choice is active (${effectiveLang}).`,
      );
      if (currentCookie !== effectiveLang) {
        this.setLangCookie(res, effectiveLang);
      }
      return;
    }

    // SILENT SYNC: For automatic mode
    const isDifferent = detectedLang !== effectiveLang;

    if (isDifferent) {
      if (currentCookie !== detectedLang) {
        this.logger.debug(
          `Performing silent sync for user ${user.id}: ${effectiveLang} -> ${detectedLang}.`,
        );
        await this.usersService
          .updateLanguage(user.id, detectedLang as Language)
          .catch((err) =>
            this.logger.error(`Failed to sync language for ${user.id}: ${err.message}`),
          );
        this.setLangCookie(res, detectedLang);
      }
    } else {
      // MATCH: Everything is in sync, ensure cookie is set if missing
      if (!currentCookie) {
        this.setLangCookie(res, effectiveLang);
      }
    }
  }

  private setLangCookie(res: Response, lang: string) {
    res.cookie('lang_synced', lang, {
      maxAge: 86400000, // 24h
      signed: true,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
  }

  private parseLanguage(req: Request): string | null {
    const header =
      (req.headers['x-client-lang'] as string) ||
      (req.headers['accept-language'] as string);
    if (!header) return null;
    const match = header.match(/^([a-z]{2})/i);
    return match ? match[1].toLowerCase() : null;
  }
}
