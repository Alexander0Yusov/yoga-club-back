import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalizedText } from '../domain/localized-text.vo';

export abstract class ITranslationService {
  abstract translateMissing(texts: LocalizedText, sourceLang?: 'ru' | 'en' | 'de' | 'uk'): Promise<LocalizedText>;
}

@Injectable()
export class DeepLTranslationService implements ITranslationService {
  private readonly logger = new Logger(DeepLTranslationService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api-free.deepl.com/v2/translate';

  constructor(configService: ConfigService) {
    this.apiKey = configService.get<string>('DEEPL_API_KEY') ?? '';
  }

  async translateMissing(texts: LocalizedText, explicitSource?: 'ru' | 'en' | 'de' | 'uk'): Promise<LocalizedText> {
    const languages = ['ru', 'en', 'de', 'uk'] as const;
    // Use explicit source or find first non-empty field
    const sourceLang = explicitSource || languages.find((lang) => !!texts[lang]);
    if (!sourceLang) return texts;

    const results = { ...texts };
    // Only translate if target is empty/missing
    const targets = languages.filter((lang) => !texts[lang]);
    if (targets.length === 0) return texts;

    try {
      for (const targetLang of targets) {
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            text: texts[sourceLang] as string,
            target_lang: targetLang.toUpperCase(),
            source_lang: sourceLang.toUpperCase(),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          results[targetLang] = data.translations[0].text;
        }
      }
    } catch (error) {
      this.logger.error(`DeepL failsafe triggered: ${error.message}`);
    }

    return results;
  }
}
