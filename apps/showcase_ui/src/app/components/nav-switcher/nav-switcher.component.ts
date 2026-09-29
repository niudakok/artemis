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

import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';

import { I18nService } from '../../core/i18n/i18n.service';
import { LOCALE_LABELS, Locale, SUPPORTED_LOCALES } from '../../core/i18n/locale';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-nav-switcher',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <nav class="floating-nav-switcher" [attr.aria-label]="'nav.aria' | t">
      <a
        routerLink="/"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{exact: true}"
        class="nav-tab-btn"
        [title]="'nav.home.title' | t"
      >
        <span class="material-symbols-outlined tab-icon">add_task</span>
        <span class="tab-label">{{ 'nav.home.label' | t }}</span>
      </a>
      <a
        routerLink="/workspace"
        routerLinkActive="active"
        class="nav-tab-btn"
        [title]="'nav.workspace.title' | t"
      >
        <span class="material-symbols-outlined tab-icon">space_dashboard</span>
        <span class="tab-label">{{ 'nav.workspace.label' | t }}</span>
      </a>
      <button
        type="button"
        class="nav-tab-btn nav-locale-btn"
        [title]="'nav.locale.title' | t"
        [attr.aria-label]="'nav.locale.title' | t"
        (click)="toggleLocale()"
      >
        <span class="material-symbols-outlined tab-icon">translate</span>
        <span class="tab-label">{{ currentLocaleLabel() }}</span>
      </button>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./nav-switcher.component.scss']
})
export class NavSwitcherComponent {
  private readonly i18n = inject(I18nService);

  /** Label of the locale a click would switch *to*, so the affordance reads as an action. */
  currentLocaleLabel(): string {
    const current = this.i18n.locale();
    const next = SUPPORTED_LOCALES.find((l) => l !== current) ?? current;
    return LOCALE_LABELS[next as Locale];
  }

  toggleLocale(): void {
    const current = this.i18n.locale();
    const next = SUPPORTED_LOCALES.find((l) => l !== current);
    if (next) this.i18n.setLocale(next);
  }
}
