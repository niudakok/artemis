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
 * Launcher options for `/api/run` (`verification_level`, `explorer_mode`).
 * Keep ids in sync with `VERIFICATION_LEVEL_PRESETS` in `artemis/config/agent.py`
 * and `EXPLORER_TIERS` in `artemis/agents/explorer/tiers.py`.
 */

export type VerificationLevelId = 'off' | 'final' | 'checkpoints' | 'strict';
export type ExplorerModeId = 'flash' | 'pro' | 'ultra';

/** One notch on a tuning slider. Holds message keys, not display text. */
export interface TuningLevel<TId extends string = string> {
  /** Wire value sent to the backend. */
  id: TId;
  /** Message key for the short name next to the slider title. */
  labelKey: string;
  /** Message key for the one-sentence summary in the hover card. */
  taglineKey: string;
  /** Message key for the plain-language time cost, e.g. "no extra time". */
  latencyKey: string;
  /** Message keys for the checks or searches performed at this level. */
  runsKeys: readonly string[];
  /** Message keys for the checks or searches omitted at this level. */
  skipsKeys?: readonly string[];
  /** Message key for when to pick this level. */
  bestForKey: string;
}

/** Message-key namespace for a ladder, e.g. `tuning.verify` or `tuning.explore`. */
const VERIFY_NS = 'tuning.verify';
const EXPLORE_NS = 'tuning.explore';

export const VERIFICATION_LEVELS: readonly TuningLevel<VerificationLevelId>[] = [
  {
    id: 'off',
    labelKey: `${VERIFY_NS}.off.label`,
    taglineKey: `${VERIFY_NS}.off.tagline`,
    latencyKey: `${VERIFY_NS}.off.latency`,
    runsKeys: [`${VERIFY_NS}.off.runs.0`, `${VERIFY_NS}.off.runs.1`],
    skipsKeys: [`${VERIFY_NS}.off.skips.0`],
    bestForKey: `${VERIFY_NS}.off.bestFor`
  },
  {
    id: 'final',
    labelKey: `${VERIFY_NS}.final.label`,
    taglineKey: `${VERIFY_NS}.final.tagline`,
    latencyKey: `${VERIFY_NS}.final.latency`,
    runsKeys: [`${VERIFY_NS}.final.runs.0`, `${VERIFY_NS}.final.runs.1`],
    skipsKeys: [`${VERIFY_NS}.final.skips.0`],
    bestForKey: `${VERIFY_NS}.final.bestFor`
  },
  {
    id: 'checkpoints',
    labelKey: `${VERIFY_NS}.checkpoints.label`,
    taglineKey: `${VERIFY_NS}.checkpoints.tagline`,
    latencyKey: `${VERIFY_NS}.checkpoints.latency`,
    runsKeys: [
      `${VERIFY_NS}.checkpoints.runs.0`,
      `${VERIFY_NS}.checkpoints.runs.1`,
      `${VERIFY_NS}.checkpoints.runs.2`,
      `${VERIFY_NS}.checkpoints.runs.3`
    ],
    bestForKey: `${VERIFY_NS}.checkpoints.bestFor`
  },
  {
    id: 'strict',
    labelKey: `${VERIFY_NS}.strict.label`,
    taglineKey: `${VERIFY_NS}.strict.tagline`,
    latencyKey: `${VERIFY_NS}.strict.latency`,
    runsKeys: [`${VERIFY_NS}.strict.runs.0`, `${VERIFY_NS}.strict.runs.1`],
    bestForKey: `${VERIFY_NS}.strict.bestFor`
  }
];

export const EXPLORER_MODES: readonly TuningLevel<ExplorerModeId>[] = [
  {
    id: 'flash',
    labelKey: `${EXPLORE_NS}.flash.label`,
    taglineKey: `${EXPLORE_NS}.flash.tagline`,
    latencyKey: `${EXPLORE_NS}.flash.latency`,
    runsKeys: [`${EXPLORE_NS}.flash.runs.0`, `${EXPLORE_NS}.flash.runs.1`],
    skipsKeys: [`${EXPLORE_NS}.flash.skips.0`],
    bestForKey: `${EXPLORE_NS}.flash.bestFor`
  },
  {
    id: 'pro',
    labelKey: `${EXPLORE_NS}.pro.label`,
    taglineKey: `${EXPLORE_NS}.pro.tagline`,
    latencyKey: `${EXPLORE_NS}.pro.latency`,
    runsKeys: [`${EXPLORE_NS}.pro.runs.0`, `${EXPLORE_NS}.pro.runs.1`],
    skipsKeys: [`${EXPLORE_NS}.pro.skips.0`],
    bestForKey: `${EXPLORE_NS}.pro.bestFor`
  },
  {
    id: 'ultra',
    labelKey: `${EXPLORE_NS}.ultra.label`,
    taglineKey: `${EXPLORE_NS}.ultra.tagline`,
    latencyKey: `${EXPLORE_NS}.ultra.latency`,
    runsKeys: [`${EXPLORE_NS}.ultra.runs.0`, `${EXPLORE_NS}.ultra.runs.1`],
    bestForKey: `${EXPLORE_NS}.ultra.bestFor`
  }
];

/** Per-run tuning sent with `/api/run` for the Pro profile. */
export interface ProTuningOptions {
  verificationLevel?: VerificationLevelId | string;
  explorerMode?: ExplorerModeId | string;
}

/** Effective defaults reported by `GET /api/run/defaults`. */
export interface ProTuningDefaults {
  verification_level?: string | null;
  explorer_mode?: string | null;
}

export const DEFAULT_VERIFICATION_LEVEL: VerificationLevelId = 'final';
export const DEFAULT_EXPLORER_MODE: ExplorerModeId = 'flash';

/** Index of a level id within its ladder; falls back to the default when unknown. */
export function levelIndex<TId extends string>(
  ladder: readonly TuningLevel<TId>[],
  id: string | null | undefined,
  fallback: TId
): number {
  const wanted = String(id ?? '').trim().toLowerCase();
  const idx = ladder.findIndex((l) => l.id === wanted);
  if (idx >= 0) return idx;
  return Math.max(0, ladder.findIndex((l) => l.id === fallback));
}

/** Slider fill percentage for a notch index on a ladder of `count` notches. */
export function notchPercent(index: number, count: number): number {
  if (count <= 1) return 0;
  const clamped = Math.min(Math.max(index, 0), count - 1);
  return (clamped / (count - 1)) * 100;
}
