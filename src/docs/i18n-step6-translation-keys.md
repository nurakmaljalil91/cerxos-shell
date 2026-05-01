# i18n Translation Keys — Step 6 Guide

Translation files live in `public/assets/i18n/{lang}.json` (en, es, fr).
Powered by `@jsverse/transloco` v8. The active lang is hydrated from `UserSessionService` on startup and updated in real time when the user changes language in Settings.

---

## 1. Pipe in templates

```html
<!-- static key -->
<span>{{ 'common.save' | transloco }}</span>

<!-- inside an element -->
<button>{{ 'auth.logout' | transloco }}</button>
```

---

## 2. TranslocoDirective — structural translation blocks

Use when translating several keys inside one container to avoid repeating the pipe:

```html
<ng-container *transloco="let t">
  <h1>{{ t('settings.title') }}</h1>
  <p>{{ t('settings.preferences') }}</p>
  <button>{{ t('common.save') }}</button>
</ng-container>
```

The directive is exported from `@jsverse/transloco` and must be imported into the component's `imports` array:

```typescript
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  standalone: true,
  imports: [TranslocoDirective],
  // ...
})
```

---

## 3. TranslocoService.translate() in TypeScript

```typescript
import { inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export class MyComponent {
  private readonly transloco = inject(TranslocoService);

  getErrorMessage(): string {
    return this.transloco.translate('common.error');
  }
}
```

> Only call `translate()` after the translation file has loaded. Use `selectTranslate()` (returns `Observable`) if you need to react to loading state.

---

## 4. Parameterized translations

Define the key with a placeholder using double curly braces:

```json
// en.json
{
  "greeting": "Hello, {{ name }}!"
}
```

Pass params as the second argument to the pipe or `translate()`:

```html
<!-- pipe -->
<p>{{ 'greeting' | transloco: { name: userName() } }}</p>
```

```typescript
this.transloco.translate('greeting', { name: 'Amal' });
// => "Hello, Amal!"
```

---

## 5. Key naming convention

Keys use **dot-notation** with two levels: `<domain>.<action-or-label>`.

| Domain | Purpose | Examples |
|---|---|---|
| `common` | Shared UI labels and states | `common.save`, `common.cancel`, `common.loading` |
| `nav` | Navigation labels | `nav.home`, `nav.settings`, `nav.profile` |
| `settings` | Settings page text | `settings.title`, `settings.language` |
| `auth` | Authentication actions | `auth.login`, `auth.logout` |

Add a new domain namespace when a feature has 3+ unique keys that do not belong to an existing domain.

---

## 6. Adding a new translation key

1. Open **all three** JSON files simultaneously: `en.json`, `es.json`, `fr.json`.
2. Add the key at the same path in each file.
3. Provide the correct translated value in Spanish and French — do not leave placeholders in production.
4. Use the key in the template or TypeScript immediately.

```json
// en.json
{ "dashboard": { "welcome": "Welcome back" } }

// es.json
{ "dashboard": { "welcome": "Bienvenido de nuevo" } }

// fr.json
{ "dashboard": { "welcome": "Content de vous revoir" } }
```

---

## 7. Checklist for adding a new page or feature

- [ ] Identify the domain namespace (create new one if needed)
- [ ] Add all required keys to `en.json`, `es.json`, and `fr.json`
- [ ] Import `TranslocoPipe` or `TranslocoDirective` into the component's `imports` array
- [ ] Replace all hardcoded UI strings with `transloco` pipe or directive
- [ ] For TypeScript-side strings (error messages, toast text), inject `TranslocoService` and call `translate()`
- [ ] Verify the UI renders correctly when language is switched in Settings
