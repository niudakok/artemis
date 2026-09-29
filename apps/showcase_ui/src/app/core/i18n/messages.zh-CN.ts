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

/** Simplified Chinese message table. */
export const ZH_CN_MESSAGES: Messages = {
  // ---------------------------------------------------------------- tuning --
  'tuning.verify.off.label': '关闭',
  'tuning.verify.off.tagline': '不做任何校验：任务看起来完成即立即结束。',
  'tuning.verify.off.latency': '不增加额外耗时',
  'tuning.verify.off.runs.0': '每执行完一个步骤即视为完成。',
  'tuning.verify.off.runs.1': '你会获得完整的动作轨迹，但没有通过 / 失败的判定结论。',
  'tuning.verify.off.skips.0': '不进行任何二次核对，也不进行任何重试。',
  'tuning.verify.off.bestFor': '快速尝试与功能演示，只想观察执行过程时使用。',

  'tuning.verify.final.label': '任务结束时',
  'tuning.verify.final.tagline': '任务结束后，对最终结果与你的目标做一次校验。这是默认档位。',
  'tuning.verify.final.latency': '在结尾增加约 20–60 秒',
  'tuning.verify.final.runs.0':
    '任务结束时，会比对最终屏幕画面、步骤历史与设备状态是否与你的要求一致。',
  'tuning.verify.final.runs.1': '若结果不符，任务会回退并尝试修复，最多 3 次。',
  'tuning.verify.final.skips.0': '任务运行过程中不做任何中间校验。',
  'tuning.verify.final.bestFor': '日常常规任务：在几乎不拖慢速度的前提下，得到诚实的通过 / 失败结论。',

  'tuning.verify.checkpoints.label': '每一步',
  'tuning.verify.checkpoints.tagline': '每个步骤完成后立即校验，并在结尾再做一次最终校验。',
  'tuning.verify.checkpoints.latency': '每步之后有一次短校验，在后台执行',
  'tuning.verify.checkpoints.runs.0': '每个步骤完成后会立刻用当时的截图进行校验。',
  'tuning.verify.checkpoints.runs.1': '如果某步出错，会先修复再继续（每步最多 2 次尝试）。',
  'tuning.verify.checkpoints.runs.2': '未通过的测试条件会被记录下来，任务继续执行。',
  'tuning.verify.checkpoints.runs.3': '结尾仍会执行最终校验。',
  'tuning.verify.checkpoints.bestFor': '长流程任务：早期一个错误若不及时纠正，会毁掉后续全部工作。',

  'tuning.verify.strict.label': '严格模式',
  'tuning.verify.strict.tagline': '每个步骤都校验，且重试次数更多。首个测试失败立即终止任务。',
  'tuning.verify.strict.latency': '最慢：校验更多、重试更多',
  'tuning.verify.strict.runs.0': '每次校验耗时更长、尝试次数更多：每步最多 4 次修复，结尾最多 5 次。',
  'tuning.verify.strict.runs.1': '首个失败的测试条件会立即终止任务，并附带完整证据。',
  'tuning.verify.strict.bestFor': '发布前验收与回归测试，绝不容忍错误的通过结论。',

  'tuning.explore.flash.label': '快速一瞥',
  'tuning.explore.flash.tagline': '一眼扫过即可定位屏幕上的按钮与文字。',
  'tuning.explore.flash.latency': '每次查找 1 次感知',
  'tuning.explore.flash.runs.0': '按名称、图标或颜色查找屏幕上的元素，并立即返回其位置坐标。',
  'tuning.explore.flash.runs.1': '可同时查找多个元素。',
  'tuning.explore.flash.skips.0': '不做局部放大，也不做二次尝试。',
  'tuning.explore.flash.bestFor': '按钮、图标与文字标注清晰的普通 App。',

  'tuning.explore.pro.label': '二次确认',
  'tuning.explore.pro.tagline': '最多感知 3 次，中间进行推理，再给出答案。',
  'tuning.explore.pro.latency': '每次查找最多 3 次感知',
  'tuning.explore.pro.runs.0': '先读取屏幕层级结构，再对画面进行搜索。',
  'tuning.explore.pro.runs.1': '若首次未命中，会在 3 次感知内换用其它策略重新查找。',
  'tuning.explore.pro.skips.0': '仍不做小区域放大，以保持查找速度。',
  'tuning.explore.pro.bestFor': '以相对位置描述的控件（如「Wi-Fi 旁边的开关」）或标注不清晰的元素。',

  'tuning.explore.ultra.label': '局部放大',
  'tuning.explore.ultra.tagline': '对屏幕局部进行放大裁剪，最多感知 8 次。',
  'tuning.explore.ultra.latency': '每次查找最多 8 次感知（最慢）',
  'tuning.explore.ultra.runs.0': '可裁剪并放大屏幕局部，逐块阅读微小文字与密集排版。',
  'tuning.explore.ultra.runs.1': '后续感知会复用前次结果，因此实际耗时比听起来更少。',
  'tuning.explore.ultra.bestFor': '元素密集的界面、极小的目标、图表与手绘内容，以及对精确位置要求极高的校验。',

  'tuning.tip.whatHappens': '执行行为',
  'tuning.tip.notIncluded': '不包含行为',
  'tuning.tip.useItFor': '适用场景',

  'tuning.slider.verify.name': '结果校验深度',
  'tuning.slider.verify.endLow': '关闭',
  'tuning.slider.verify.endHigh': '严格',
  'tuning.slider.explore.name': '屏幕感知深度',
  'tuning.slider.explore.endLow': '更快速',
  'tuning.slider.explore.endHigh': '更精准',
};
