import { LocalizedText } from '../../domain/localized-text.vo';

export class LocalizedTextMapper {
  static resolve(text: LocalizedText | undefined, lang: string): string {
    if (!text) return '';

    // 1. Try requested language
    const requested = text[lang as keyof LocalizedText];
    if (requested) return requested;

    // 2. Specific fallback: if requested was uk, try ru
    if (lang === 'uk' && text.ru) {
      return text.ru;
    }

    // 3. Global default: en
    if (text.en) return text.en;

    // 4. Ultimate fallback: ru (since it is required in the constructor/domain)
    return text.ru || '';
  }

  static isLocalizedText(obj: any): boolean {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;

    const keys = Object.keys(obj);
    if (keys.length === 0) return false;

    const whitelist = ['ru', 'en', 'uk', 'de'];
    
    // Must have at least 'ru'
    if (!obj.ru && !obj.en && !obj.uk && !obj.de) return false;

    // All keys must be in the whitelist
    return keys.every(key => whitelist.includes(key));
  }
}
