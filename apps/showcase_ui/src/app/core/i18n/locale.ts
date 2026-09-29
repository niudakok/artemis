/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** Locales the Showcase UI ships translations for. */
export type Locale = 'zh-CN' | 'en';

/** Canonical locale used as the key of every translation table. */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Locale shown when the user has no stored preference. Keeping this separate
 * from `DEFAULT_LOCALE` lets the en table stay the reference/fallback for
 * missing keys while the *initial UI* reads in Chinese.
 */
export const DEFAULT_UI_LOCALE: Locale = 'zh-CN';

export const SUPPORTED_LOCALES: readonly Locale[] = ['zh-CN', 'en'];

/** Human-readable names, each rendered in its own language. */
export const LOCALE_LABELS: Record<Locale, string> = {
  'zh-CN': '简体中文',
  en: 'English',
};

export function isSupportedLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

const STORAGE_KEY = 'artemis.locale';

export function readStoredLocale(): Locale | null {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    return isSupportedLocale(stored) ? stored : null;
  } catch {
    // Private-mode Safari and sandboxed iframes throw on localStorage access.
    return null;
  }
}

export function persistLocale(locale: Locale): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, locale);
  } catch {
    // A failed preference write must never break language switching.
  }
}
