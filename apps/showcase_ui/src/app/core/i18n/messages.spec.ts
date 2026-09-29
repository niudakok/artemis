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

import { EN_MESSAGES } from './messages.en';
import { ZH_CN_MESSAGES } from './messages.zh-CN';
import { SUPPORTED_LOCALES } from './locale';
import { t, setRuntimeTranslator } from './runtime';

const TABLES = { en: EN_MESSAGES, 'zh-CN': ZH_CN_MESSAGES } as const;

describe('message tables', () => {
  afterEach(() => setRuntimeTranslator(null));

  it('covers every shipped locale', () => {
    expect(Object.keys(TABLES).sort()).toEqual([...SUPPORTED_LOCALES].sort());
  });

  it('defines exactly the same keys in every locale', () => {
    // A key present in one locale but not another silently falls back to
    // English at runtime, which is the bug this guard exists to prevent.
    const reference = Object.keys(EN_MESSAGES).sort();
    for (const locale of SUPPORTED_LOCALES) {
      const keys = Object.keys(TABLES[locale]).sort();
      const missing = reference.filter((k) => !keys.includes(k));
      const extra = keys.filter((k) => !reference.includes(k));
      expect(missing).withContext(`missing in ${locale}`).toEqual([]);
      expect(extra).withContext(`not in en reference (${locale})`).toEqual([]);
    }
  });

  it('has no empty messages', () => {
    for (const locale of SUPPORTED_LOCALES) {
      for (const [key, value] of Object.entries(TABLES[locale])) {
        expect(value.trim().length).withContext(`${locale}/${key} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('keeps interpolation placeholders identical across locales', () => {
    // A placeholder dropped in translation leaves "{name}" visible in the UI.
    const placeholders = (s: string) => (s.match(/\{\s*[\w.]+\s*\}/g) ?? []).map((p) => p.replace(/\s/g, '')).sort();
    for (const [key, en] of Object.entries(EN_MESSAGES)) {
      const zh = ZH_CN_MESSAGES[key];
      if (zh === undefined) continue;
      expect(placeholders(zh)).withContext(`placeholders differ for ${key}`).toEqual(placeholders(en));
    }
  });
});

describe('runtime t()', () => {
  afterEach(() => setRuntimeTranslator(null));

  it('falls back to the reference locale before bootstrap', () => {
    expect(t('tool.title.tap')).toBe('Tapping Element');
    expect(t('common.unknownError')).toBe('Unknown error');
  });

  it('interpolates named parameters', () => {
    // Callers pass pre-formatted values; the message only substitutes them.
    expect(t('tool.title.swipeDir', { dir: 'UP' })).toBe('Swiping Screen (UP)');
    expect(t('tool.input.durationValue', { duration: 250 })).toBe('Duration: 250ms');
  });

  it('leaves unknown placeholders visible instead of printing undefined', () => {
    expect(t('tool.input.durationValue')).toBe('Duration: {duration}ms');
  });

  it('returns the key itself when nothing matches', () => {
    expect(t('nope.not.here')).toBe('nope.not.here');
  });

  it('prefers a registered translator', () => {
    setRuntimeTranslator((key) => (key === 'tool.title.tap' ? '点我' : 'miss'));
    expect(t('tool.title.tap')).toBe('点我');
    expect(t('tool.title.swipe')).toBe('miss');
  });
});
