import { SetMetadata } from '@nestjs/common';

export const SKIP_LOCALIZATION_KEY = 'skipLocalization';
export const SkipLocalization = () => SetMetadata(SKIP_LOCALIZATION_KEY, true);
