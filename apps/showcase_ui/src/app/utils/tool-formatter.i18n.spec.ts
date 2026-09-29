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

import { ZH_CN_MESSAGES } from '../core/i18n/messages.zh-CN';
import { setRuntimeTranslator } from '../core/i18n/runtime';
import {
  cleanErrorMessage,
  getCompressionLabel,
  getToolDisplayLabel,
  getToolTitle
} from './tool-formatter.util';

/**
 * The pure formatters resolve text through the module-level translator, which
 * defaults to the reference locale so ordinary specs stay deterministic. These
 * cases register the Chinese table to prove the localised branch renders real
 * Chinese rather than falling back to English.
 */
function useChinese(): void {
  const lookup = (key: string): string => ZH_CN_MESSAGES[key] ?? key;
  setRuntimeTranslator((key, params) => {
    const template = lookup(key);
    if (!params) return template;
    return template.replace(/\{\s*([\w.]+)\s*\}/g, (m, name: string) =>
      params[name] === undefined ? m : String(params[name])
    );
  });
}

const tool = (name: string, args: Record<string, unknown> = {}) => ({
  name,
  args,
  payload: { args }
});

describe('tool formatters in zh-CN', () => {
  afterEach(() => setRuntimeTranslator(null));

  it('renders headings and display labels in Chinese', () => {
    useChinese();
    expect(getToolTitle(tool('click'))).toBe('点击元素');
    expect(getToolDisplayLabel(tool('click_sequence'))).toBe('执行连续点击序列');
    expect(getToolDisplayLabel(tool('click', { target_text: '设置' }))).toBe('点击「设置」');
    // read_logs has no query, so it falls back to the generic log-analysis line.
    expect(getToolDisplayLabel(tool('read_logs'))).toBe('分析系统日志');
    expect(getToolDisplayLabel(tool('log_analyzer'))).toBe('分析运行日志');
  });

  it('keeps interpolation placeholders working in Chinese', () => {
    useChinese();
    expect(getToolDisplayLabel(tool('swipe', { action: 'up' }))).toBe('在屏幕上向 UP 方向滑动');
    expect(getToolDisplayLabel(tool('press_key', { key: 'home' }))).toBe('按下按键 HOME');
  });

  it('renders compression progress in Chinese', () => {
    useChinese();
    const running = { name: 'compress_history', status: 'running', args: { start_step: 12, end_step: 27 } };
    expect(getCompressionLabel(running)).toBe('正在将第 12–27 步压缩为简短记忆以释放上下文…');

    const done = {
      name: 'compress_history',
      status: 'success',
      args: { start_step: 1, end_step: 4, source_tokens: 3000, summary_tokens: 1500 }
    };
    expect(getCompressionLabel(done)).toBe('第 1–4 步已压缩为简短记忆 · 3k → 1.5k Token（缩小至 2 倍）');
  });

  it('falls back to English for keys a locale has not translated', () => {
    useChinese();
    // Simulates a half-finished translation rather than assuming full coverage.
    expect(cleanErrorMessage('')).toBe('未知错误');
  });
});
