export type PreferenceControlName =
  | 'language'
  | 'defaultLanding'
  | 'dateFormat'
  | 'currencyFormat'
  | 'theme'
  | 'density'
  | 'compactNavigation'
  | 'analyticsHints'
  | 'timeZone';

export type PreferenceFormValue = {
  language: string;
  defaultLanding: string;
  dateFormat: string;
  currencyFormat: string;
  theme: string;
  density: string;
  compactNavigation: boolean;
  analyticsHints: boolean;
  timeZone: string;
};

export const PREFERENCE_KEYS: Record<PreferenceControlName, string> = {
  language: 'ui.language',
  defaultLanding: 'ui.defaultLanding',
  dateFormat: 'ui.dateFormat',
  currencyFormat: 'ui.currencyFormat',
  theme: 'theme',
  density: 'ui.density',
  compactNavigation: 'ui.compactNavigation',
  analyticsHints: 'ui.analyticsHints',
  timeZone: 'timezone',
};

export const PREFERENCE_KEY_ALIASES: Record<PreferenceControlName, string[]> = {
  language: ['language'],
  defaultLanding: ['defaultLanding', 'default_landing'],
  dateFormat: ['dateFormat', 'date_format'],
  currencyFormat: ['currencyFormat', 'currency_format', 'currency'],
  theme: ['ui.theme'],
  density: ['density'],
  compactNavigation: ['compactNavigation', 'compact_navigation'],
  analyticsHints: ['analyticsHints', 'analytics_hints'],
  timeZone: [],
};

const FALLBACK_TIME_ZONE = 'UTC';

/** Returns the browser's IANA time zone, used as the suggested value when none is saved. */
export function detectBrowserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIME_ZONE;
  } catch {
    return FALLBACK_TIME_ZONE;
  }
}

/** Returns the IANA time zone ids supported by the browser, always including UTC and the given zone. */
export function getTimeZoneOptions(current: string): string[] {
  const supported =
    typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [];
  return Array.from(new Set([FALLBACK_TIME_ZONE, current, ...supported])).sort((a, b) =>
    a.localeCompare(b),
  );
}

export const DEFAULT_PREFERENCES: PreferenceFormValue = {
  language: 'en',
  defaultLanding: 'dashboard',
  dateFormat: 'mdy',
  currencyFormat: 'usd',
  theme: 'light',
  density: 'comfortable',
  compactNavigation: true,
  analyticsHints: false,
  timeZone: detectBrowserTimeZone(),
};
