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

import { DEFAULT_LOCALE } from './locale';
import { EN_MESSAGES } from './messages.en';
import { TranslateParams, Translator } from './types';

/**
 * Module-level translator used by *pure* formatter helpers.
 *
 * `I18nService` needs Angular's injector, but the trace formatters in
 * `utils/` are deliberately dependency-free and build composite sentences
 * (interpolation plus conditional joins) that cannot return a single key.
 * This mirrors Angular's own `$localize` escape hatch: one function, no DI.
 *
 * Before the app bootstraps — and therefore in unit tests — lookups resolve
 * against the reference locale, which keeps tests deterministic.
 */
let translator: Translator | null = null;

/** Register the active translator. Passing `null` restores the fallback. */
export function setRuntimeTranslator(next: Translator | null): void {
  translator = next;
}

function fallbackLookup(key: string, params?: TranslateParams): string {
  const template = EN_MESSAGES[key];
  if (template === undefined) return key;
  if (!params) return template;
  return template.replace(/\{\s*([\w.]+)\s*\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

/** Translate a key from plain code. See the module comment for constraints. */
export function t(key: string, params?: TranslateParams): string {
  return translator ? translator(key, params) : fallbackLookup(key, params);
}

/** Locale the fallback path resolves against; exposed for tests. */
export const FALLBACK_LOCALE = DEFAULT_LOCALE;
