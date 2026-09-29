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

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { I18nService } from './i18n.service';
import { TranslatePipe } from './translate.pipe';
import { setRuntimeTranslator } from './runtime';

@Component({
  standalone: true,
  imports: [TranslatePipe],
  template: `{{ 'nav.workspace.label' | t }}|{{ pythonProbeTitle() }}`,
})
class PipeHost {
  constructor(private readonly i18n: I18nService) {}

  // Simulates a method-driven binding (like the probe subtitle helpers).
  pythonProbeTitle(): string {
    return this.i18n.t('nav.home.label');
  }
}

describe('TranslatePipe reactivity', () => {
  let service: I18nService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nService);
  });

  afterEach(() => {
    service.setLocale('en');
    setRuntimeTranslator(null);
    localStorage.clear();
  });

  it('re-renders piped text when the locale changes (no page refresh)', () => {
    const fixture = TestBed.createComponent(PipeHost);
    service.setLocale('zh-CN');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('工作区|新建 / 首页');

    // Switch to English: both the pure-pipe AND the method binding update.
    service.setLocale('en');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('Workspace|New / Home');

    // And back to Chinese.
    service.setLocale('zh-CN');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('工作区|新建 / 首页');
  });
});