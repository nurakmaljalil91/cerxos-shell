export type PreferenceControlName =
  | 'language'
  | 'defaultLanding'
  | 'dateFormat'
  | 'currencyFormat'
  | 'theme'
  | 'density'
  | 'compactNavigation'
  | 'analyticsHints';

export type PreferenceFormValue = {
  language: string;
  defaultLanding: string;
  dateFormat: string;
  currencyFormat: string;
  theme: string;
  density: string;
  compactNavigation: boolean;
  analyticsHints: boolean;
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
};

export const DEFAULT_PREFERENCES: PreferenceFormValue = {
  language: 'en',
  defaultLanding: 'dashboard',
  dateFormat: 'mdy',
  currencyFormat: 'usd',
  theme: 'light',
  density: 'comfortable',
  compactNavigation: true,
  analyticsHints: false,
};
