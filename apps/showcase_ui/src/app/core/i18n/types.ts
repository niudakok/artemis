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

/**
 * Shared i18n types. Kept in their own dependency-free module so the service
 * and the runtime translator can both use them without importing each other.
 */

/** Flat `dotted.key` -> template string. */
export type Messages = Readonly<Record<string, string>>;

/** Values substituted into a message's `{placeholder}` slots. */
export type TranslateParams = Readonly<Record<string, string | number>>;

/** Resolves a key to display text. */
export type Translator = (key: string, params?: TranslateParams) => string;
