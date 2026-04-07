import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Request } from 'express';
import { LocalizedTextMapper } from '../../modules/content/api/mappers/localized-text.mapper';
import { UserContextDto } from '../../modules/user-accounts/guards/dto/user-context.dto';

@Injectable()
export class LocalizationInterceptor implements NestInterceptor {
  private readonly MAX_DEPTH = 10;

  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();

    // 1. BYPASS LOGIC (CRITICAL for Admin Panel / CMS)
    // - Check for specific header
    // - Check for specific metadata (decorator)
    const isRawRequested = req.headers['x-raw-langs'] === 'true';
    const skipLocalization = this.reflector.getAllAndOverride<boolean>(
      'skipLocalization',
      [context.getHandler(), context.getClass()],
    );

    if (isRawRequested || skipLocalization) {
      return next.handle();
    }

    // 2. Detect language
    const lang = this.resolveLanguage(req);

    return next.handle().pipe(
      map((data) => {
        // 3. Recursively flatten localized texts with safety limits
        return this.flatten(data, lang, 0);
      }),
    );
  }

  private resolveLanguage(req: Request): string {
    const supported = ['ru', 'en', 'uk', 'de'];
    const defaultLang = 'ru';

    const user = req.user as UserContextDto;
    if (user?.lang) return user.lang;

    const cookieLang = req.signedCookies?.lang_synced;
    if (cookieLang && supported.includes(cookieLang)) return cookieLang;

    const header = req.headers['accept-language'];
    if (header) {
      const detected = header.split(',')[0].split('-')[0].toLowerCase();
      if (supported.includes(detected)) return detected;
    }

    return defaultLang;
  }

  private flatten(data: any, lang: string, depth: number): any {
    // Stop if reached max depth or no data
    if (depth > this.MAX_DEPTH || data === null || data === undefined) {
      return data;
    }

    // Skip non-objects OR special objects (Dates, Buffers, etc.)
    const type = Object.prototype.toString.call(data);
    if (type !== '[object Object]' && type !== '[object Array]') {
      return data;
    }

    // 1. Array handling
    if (Array.isArray(data)) {
      return data.map((item) => this.flatten(item, lang, depth + 1));
    }

    // 2. LocalizedText handling (Detected by heuristic)
    if (LocalizedTextMapper.isLocalizedText(data)) {
      return LocalizedTextMapper.resolve(data, lang);
    }

    // 3. Object handling (recursive)
    const flattened: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        flattened[key] = this.flatten(data[key], lang, depth + 1);
      }
    }
    return flattened;
  }
}
