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

import { Injectable, computed, signal } from '@angular/core';

import { EN_MESSAGES } from './messages.en';
import { ZH_CN_MESSAGES } from './messages.zh-CN';
import {
  DEFAULT_LOCALE,
  Locale,
  SUPPORTED_LOCALES,
  detectInitialLocale,
  persistLocale,
  readStoredLocale,
} from './locale';

/** Flat `dotted.key` -> template string. */
export type Messages = Readonly<Record<string, string>>;

export type TranslateParams = Readonly<Record<string, string | number>>;

const TABLES: Record<Locale, Messages> = {
  en: EN_MESSAGES,
  'zh-CN': ZH_CN_MESSAGES,
};

/** Matches `{name}` placeholders, tolerating whitespace inside the braces. */
const PLACEHOLDER = /\{\s*([\w.]+)\s*\}/g;

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(PLACEHOLDER, (match, name: string) => {
    const value = params[name];
    // Leaving unknown placeholders visible makes a missing param obvious
    // instead of silently rendering "undefined" into the UI.
    return value === undefined ? match : String(value);
  });
}

/**
 * Locale state and message lookup for the Showcase UI.
 *
 * Formatter helpers stay pure and return message *keys*; this service is the
 * single place that turns a key into text. That keeps translation data out of
 * logic code and lets unit tests assert on keys, which stay stable across
 * languages.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly current = signal<Locale>(readStoredLocale() ?? detectInitialLocale());

  /** Reactive locale, readable from templates and pipes. */
  readonly locale = this.current.asReadonly();
  readonly supported = SUPPORTED_LOCALES;
  readonly isChinese = computed(() => this.current() === 'zh-CN');

  setLocale(locale: Locale): void {
    if (!TABLES[locale]) return;
    this.current.set(locale);
    persistLocale(locale);
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = locale;
    }
  }

  /**
   * Resolve `key` in the active locale, interpolating `params`.
   *
   * Falls back to the default locale, then to the key itself so a missing
   * translation degrades to a visible identifier rather than blank UI.
   */
  t(key: string, params?: TranslateParams): string {
    const table = TABLES[this.current()] ?? TABLES[DEFAULT_LOCALE];
    const template = table[key] ?? TABLES[DEFAULT_LOCALE][key];
    if (template === undefined) return key;
    return interpolate(template, params);
  }

  /** True when the key exists in every shipped locale. */
  has(key: string): boolean {
    return SUPPORTED_LOCALES.every((locale) => TABLES[locale][key] !== undefined);
  }
}
