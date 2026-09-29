import { EN_MESSAGES } from '../i18n/messages.en';
import { ZH_CN_MESSAGES } from '../i18n/messages.zh-CN';
import { Messages } from '../i18n/i18n.service';
import {
  DEFAULT_EXPLORER_MODE,
  DEFAULT_VERIFICATION_LEVEL,
  EXPLORER_MODES,
  VERIFICATION_LEVELS,
  levelIndex,
  notchPercent
} from './pro-tuning.model';

const TABLES: Messages[] = [EN_MESSAGES, ZH_CN_MESSAGES];

describe('pro tuning ladders', () => {
  it('keeps every notch id and label unique within its ladder', () => {
    for (const ladder of [VERIFICATION_LEVELS, EXPLORER_MODES]) {
      expect(new Set(ladder.map((l) => l.id)).size).toBe(ladder.length);
      expect(new Set(ladder.map((l) => l.labelKey)).size).toBe(ladder.length);
    }
  });

  it('mirrors the backend wire values', () => {
    expect(VERIFICATION_LEVELS.map((l) => l.id)).toEqual(['off', 'final', 'checkpoints', 'strict']);
    expect(EXPLORER_MODES.map((l) => l.id)).toEqual(['flash', 'pro', 'ultra']);
    expect(VERIFICATION_LEVELS.map((l) => l.id)).toContain(DEFAULT_VERIFICATION_LEVEL);
    expect(EXPLORER_MODES.map((l) => l.id)).toContain(DEFAULT_EXPLORER_MODE);
  });

  it('every level explains itself', () => {
    for (const level of [...VERIFICATION_LEVELS, ...EXPLORER_MODES]) {
      expect(level.runsKeys.length).toBeGreaterThan(0);
      expect(level.taglineKey).toMatch(/^tuning\./);
      expect(level.bestForKey).toMatch(/^tuning\./);
    }
  });

  it('resolves every referenced key in every shipped locale', () => {
    // Keys are now the source of truth, so a missing translation is a build-time
    // failure rather than English text leaking into the Chinese UI.
    const keys: string[] = [];
    for (const level of [...VERIFICATION_LEVELS, ...EXPLORER_MODES]) {
      keys.push(level.labelKey, level.taglineKey, level.latencyKey, level.bestForKey);
      keys.push(...level.runsKeys, ...(level.skipsKeys ?? []));
    }
    for (const table of TABLES) {
      for (const key of keys) {
        expect(table[key]).withContext(`missing message for ${key}`).toBeDefined();
        expect(table[key]!.length).withContext(`empty message for ${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('resolves ids case-insensitively and falls back to the default', () => {
    expect(levelIndex(VERIFICATION_LEVELS, ' STRICT ', DEFAULT_VERIFICATION_LEVEL)).toBe(3);
    expect(levelIndex(VERIFICATION_LEVELS, 'nope', DEFAULT_VERIFICATION_LEVEL)).toBe(1);
    expect(levelIndex(EXPLORER_MODES, null, DEFAULT_EXPLORER_MODE)).toBe(0);
  });

  it('maps notches onto the track', () => {
    expect(notchPercent(0, 4)).toBe(0);
    expect(notchPercent(3, 4)).toBe(100);
    expect(notchPercent(1, 3)).toBe(50);
    expect(notchPercent(9, 3)).toBe(100);
    expect(notchPercent(0, 1)).toBe(0);
  });
});
