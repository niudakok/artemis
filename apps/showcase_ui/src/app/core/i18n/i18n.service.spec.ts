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

import { TestBed } from '@angular/core/testing';

import { I18nService } from './i18n.service';
import { setRuntimeTranslator, t } from './runtime';
import { LOCALE_LABELS, SUPPORTED_LOCALES, DEFAULT_UI_LOCALE, isSupportedLocale } from './locale';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nService);
  });

  afterEach(() => {
    // The runtime translator is module-global. Reset the locale *before*
    // unregistering so no later spec can observe a Chinese fallback through a
    // still-live translator, and drop the preference so the next run starts
    // from the browser default.
    service.setLocale('en');
    setRuntimeTranslator(null);
    localStorage.clear();
  });

  it('resolves the same key to different text per locale', () => {
    service.setLocale('en');
    const english = service.t('nav.workspace.label');
    service.setLocale('zh-CN');
    const chinese = service.t('nav.workspace.label');
    expect(english).toBe('Workspace');
    expect(chinese).toBe('工作区');
    expect(english).not.toBe(chinese);
  });

  it('exposes the locale reactively so templates and pipes update', () => {
    service.setLocale('en');
    expect(service.locale()).toBe('en');
    expect(service.isChinese()).toBeFalse();
    service.setLocale('zh-CN');
    expect(service.locale()).toBe('zh-CN');
    expect(service.isChinese()).toBeTrue();
  });

  it('registers a runtime translator so pure helpers follow the locale', () => {
    service.setLocale('en');
    expect(t('nav.workspace.label')).toBe('Workspace');
    service.setLocale('zh-CN');
    // The module-level helper is the path taken by the pure formatters.
    expect(t('nav.workspace.label')).toBe('工作区');
  });

  it('persists the choice and restores it on the next visit', () => {
    service.setLocale('zh-CN');
    expect(localStorage.getItem('artemis.locale')).toBe('zh-CN');
    const restored = TestBed.inject(I18nService);
    expect(restored.locale()).toBe('zh-CN');
  });

  it('ignores an unsupported locale', () => {
    service.setLocale('en');
    service.setLocale('fr' as never);
    expect(service.locale()).toBe('en');
  });

  it('sets the document language so screen readers follow', () => {
    service.setLocale('zh-CN');
    expect(document.documentElement.lang).toBe('zh-CN');
  });
});

describe('locale helpers', () => {
  it('defaults the initial UI to Chinese but keeps English available', () => {
    expect(DEFAULT_UI_LOCALE).toBe('zh-CN');
    // A fresh service reads no stored preference, so it falls back to Chinese.
    localStorage.clear();
    const fresh = TestBed.inject(I18nService);
    expect(fresh.locale()).toBe('zh-CN');
    // Switching remains available.
    fresh.setLocale('en');
    expect(fresh.locale()).toBe('en');
  });

  it('labels every supported locale in its own language', () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(LOCALE_LABELS[locale]).toBeTruthy();
    }
    expect(LOCALE_LABELS['zh-CN']).toBe('简体中文');
    expect(LOCALE_LABELS.en).toBe('English');
  });

  it('validates locale tags', () => {
    expect(isSupportedLocale('zh-CN')).toBeTrue();
    expect(isSupportedLocale('fr')).toBeFalse();
    expect(isSupportedLocale(null)).toBeFalse();
  });
});
