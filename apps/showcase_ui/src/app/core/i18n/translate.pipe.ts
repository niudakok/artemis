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

import { Pipe, PipeTransform, inject } from '@angular/core';

import { I18nService } from './i18n.service';
import { TranslateParams } from './types';

/**
 * Resolves a message key in the active locale: `{{ 'nav.home' | t }}`.
 *
 * Deliberately an *impure* (`pure: false`) pipe. A pure pipe is only re-run when
 * its *input* changes, and most keys are string literals — so switching language
 * would leave text stale (the transform would never re-run). Impure makes the
 * signal read inside `transform` a tracked template dependency, so Angular
 * schedules change detection and re-evaluates the pipe whenever the locale
 * signal changes.
 */
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string | null | undefined, params?: TranslateParams): string {
    if (!key) return '';
    return this.i18n.t(key, params);
  }
}
