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

import { Messages } from './i18n.service';

/**
 * English message table. This is the reference locale: `I18nService.t` falls
 * back here, so a key must exist in this file even while its translation is
 * still being written.
 */
export const EN_MESSAGES: Messages = {
  // ---------------------------------------------------------------- tuning --
  'tuning.verify.off.label': 'Off',
  'tuning.verify.off.tagline': 'No checking. The run ends as soon as the task looks done.',
  'tuning.verify.off.latency': 'no extra time',
  'tuning.verify.off.runs.0': 'Each step is treated as finished the moment it is carried out.',
  'tuning.verify.off.runs.1': 'You get the full action trace, but no pass / fail verdict.',
  'tuning.verify.off.skips.0': 'Nothing is double-checked and nothing is retried.',
  'tuning.verify.off.bestFor': 'Quick tries and demos, when you only want to watch what happens.',

  'tuning.verify.final.label': 'At the end',
  'tuning.verify.final.tagline': 'One check of the finished result against your goal. This is the default.',
  'tuning.verify.final.latency': 'adds about 20–60 s at the end',
  'tuning.verify.final.runs.0':
    'When the task finishes, the final screen, the step history and the device state are compared with what you asked for.',
  'tuning.verify.final.runs.1':
    'If the result does not match, the task goes back and tries to fix it, up to 3 times.',
  'tuning.verify.final.skips.0': 'Nothing is checked while the task is still running.',
  'tuning.verify.final.bestFor':
    'Everyday tasks: an honest pass / fail without slowing the run down.',

  'tuning.verify.checkpoints.label': 'Every step',
  'tuning.verify.checkpoints.tagline':
    'Each step is checked as soon as it is done, plus the final check.',
  'tuning.verify.checkpoints.latency': 'a short check after each step, done in the background',
  'tuning.verify.checkpoints.runs.0':
    'Every step is checked right after it completes, using the screenshots from that moment.',
  'tuning.verify.checkpoints.runs.1':
    'If a step went wrong, it gets fixed before moving on (up to 2 tries per step).',
  'tuning.verify.checkpoints.runs.2': 'A failed test condition is written down and the task keeps going.',
  'tuning.verify.checkpoints.runs.3': 'The final check still runs at the end.',
  'tuning.verify.checkpoints.bestFor':
    'Long tasks where one early mistake would spoil everything after it.',

  'tuning.verify.strict.label': 'Strict',
  'tuning.verify.strict.tagline':
    'Every step is checked, with more retries. The first failed test stops the run.',
  'tuning.verify.strict.latency': 'slowest: more checks and more retries',
  'tuning.verify.strict.runs.0':
    'Each check takes longer and gets more attempts: 4 fixes per step and 5 at the end.',
  'tuning.verify.strict.runs.1':
    'The first failed test condition stops the run immediately, with the evidence attached.',
  'tuning.verify.strict.bestFor':
    'Release checks and regression runs, where a wrong pass is never acceptable.',

  'tuning.explore.flash.label': 'Quick glance',
  'tuning.explore.flash.tagline': 'Finds buttons and text on the screen in a single look.',
  'tuning.explore.flash.latency': '1 look per search',
  'tuning.explore.flash.runs.0':
    'Something on screen is asked for by name, icon or colour and its position comes back straight away.',
  'tuning.explore.flash.runs.1': 'Several things can be looked up at once.',
  'tuning.explore.flash.skips.0': 'No zooming in and no second try.',
  'tuning.explore.flash.bestFor': 'Ordinary apps with clearly labelled buttons, icons and text.',

  'tuning.explore.pro.label': 'Second look',
  'tuning.explore.pro.tagline': 'Takes up to 3 looks, thinking in between, before answering.',
  'tuning.explore.pro.latency': 'up to 3 looks per search',
  'tuning.explore.pro.runs.0': 'The screen layout is read first, then the picture is searched.',
  'tuning.explore.pro.runs.1': 'If the first try misses, a different approach is tried within the 3 looks.',
  'tuning.explore.pro.skips.0': 'Still no zooming into small areas, to keep searches short.',
  'tuning.explore.pro.bestFor':
    'Things described by where they are ("the switch next to Wi-Fi") or with unclear labels.',

  'tuning.explore.ultra.label': 'Close-up',
  'tuning.explore.ultra.tagline': 'Zooms into parts of the screen and takes up to 8 looks.',
  'tuning.explore.ultra.latency': 'up to 8 looks per search (slowest)',
  'tuning.explore.ultra.runs.0':
    'Parts of the screen can be cropped and magnified to read tiny text and crowded layouts piece by piece.',
  'tuning.explore.ultra.runs.1':
    'Later looks reuse the earlier ones, so they cost less time than they sound.',
  'tuning.explore.ultra.bestFor':
    'Crowded screens, tiny targets, charts and drawings, and checks where exact placement matters.',

  'tuning.tip.whatHappens': 'What happens',
  'tuning.tip.notIncluded': 'Not included',
  'tuning.tip.useItFor': 'Use it for',

  'tuning.slider.verify.name': 'Result check',
  'tuning.slider.verify.endLow': 'Off',
  'tuning.slider.verify.endHigh': 'Strict',
  'tuning.slider.explore.name': 'Screen reading',
  'tuning.slider.explore.endLow': 'Faster',
  'tuning.slider.explore.endHigh': 'Sharper',
};
