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
}
