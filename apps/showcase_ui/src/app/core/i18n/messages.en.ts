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

import { Messages } from './types';

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

  // ------------------------------------------------------- tool: video view --
  'tool.video.alreadyAnalyzing': 'Another video agent is already analyzing this evidence.',
  'tool.video.status.running': 'Analyzing screen recording',
  'tool.video.status.recovering': 'Analyzing unfinished recording segment',
  'tool.video.status.waiting': 'Waiting for existing video analysis',
  'tool.video.title.reused': 'Reused video analysis',
  'tool.video.title.complete': 'Analyzed screen recording',
  'tool.video.title.partial': 'Video analysis partially completed',
  'tool.video.title.failed': 'Video analysis returned no result',

  // --------------------------------------------------------- tool: agent id --
  'tool.agent.outputter': 'Outputter',
  'tool.agent.validator': 'Validator',
  'tool.agent.diagnoser': 'Diagnoser',
  'tool.agent.explorer': 'Explorer',

  // ------------------------------------------------- tool: display labels ---
  'tool.app.generic': 'Application',
  'tool.verb.launching': 'Launching',
  'tool.verb.stopping': 'Stopping',
  'tool.verb.managing': 'Managing',

  'tool.action.waitSecond': 'Waiting for {delay} second...',
  'tool.action.waitSeconds': 'Waiting for {delay} seconds...',
  'tool.action.waitDelay': 'Waiting for delay...',
  'tool.action.waitText': 'Waiting for text "{text}" to appear on screen',
  'tool.action.waitTextGeneric': 'Waiting for text on screen',
  'tool.action.enterText': 'Entering text "{text}" into field',
  'tool.action.enterTextGeneric': 'Entering text into input field',
  'tool.action.focusAndType': 'Focusing field and typing "{text}"',
  'tool.action.focusAndTypeGeneric': 'Focusing field and entering text',
  'tool.action.focusAndClear': 'Focusing and clearing field text',
  'tool.action.tap': 'Tapping on "{target}"',
  'tool.action.tapGeneric': 'Tapping on screen element',
  'tool.action.clickSequence': 'Executing click sequence',
  'tool.action.longPress': 'Long pressing on "{target}"',
  'tool.action.longPressGeneric': 'Long pressing screen element',
  'tool.action.swipe': 'Swiping {dir} on screen',
  'tool.action.swipeGeneric': 'Swiping screen',
  'tool.action.pressKey': 'Pressing key {key}',
  'tool.action.pressKeyGeneric': 'Pressing hardware key',
  'tool.action.createNote': 'Creating note',
  'tool.action.saveNote': 'Saving note',
  'tool.action.readNote': 'Reading note',
  'tool.action.browseNotes': 'Browsing all saved notes',
  'tool.action.updateNote': 'Updating note',
  'tool.action.locate': 'Locating on screen: "{q}"',
  'tool.action.locateGeneric': 'Locating elements on screen',
  'tool.action.searchScreen': 'Searching on screen: "{query}"',
  'tool.action.searchScreenGeneric': 'Searching on screen',
  'tool.action.investigate': 'Investigating issue: {reason}',
  'tool.action.investigateGeneric': 'Investigating execution issue',
  'tool.action.runCommand': 'Running command: {cmd}',
  'tool.action.runCommandGeneric': 'Running system command',
  'tool.action.searchLogs': 'Searching logs for "{q}"',
  'tool.action.searchLogsGeneric': 'Analyzing system logs',
  'tool.action.analyzeLogs': 'Analyzing logs',
  'tool.action.diagnose': 'Diagnosing issue',
  'tool.action.analyzeRecording': 'Analyzing screen recording',
  'tool.action.cropSegment': 'Cropping screen recording segment{range}',
  'tool.action.subAgentRecording': 'Analyzing recording with sub-agent: "{q}"',
  'tool.action.subAgentRecordingGeneric': 'Analyzing recording with sub-agent',
  'tool.action.audioTrack': 'Analyzing audio track: "{q}"',
  'tool.action.audioTrackGeneric': 'Analyzing recording audio track',
  'tool.action.historySearch': 'Searching execution history for "{q}"{range}',
  'tool.action.historySearchGeneric': 'Searching execution history{range}',
  'tool.action.reviewRange': 'Reviewing steps {start}–{end}',
  'tool.action.reviewStep': 'Reviewing step {n}',
  'tool.action.reviewStepGeneric': 'Reviewing step details',
  'tool.action.actionLanding': "Looking at where step {n}'s action landed",
  'tool.action.actionLandingGeneric': 'Looking at where an action landed',
  'tool.action.screenAroundStep': 'Looking at the screen {which} step {n}',
  'tool.action.screenAroundStepGeneric': 'Looking at a step screenshot',
  'tool.action.readDeviceState': 'Reading {kind} from the device',
  'tool.action.readDeviceStateGeneric': 'Reading device state',
  'tool.action.synthesizeReport': 'Synthesizing output report',
  'tool.action.webSearch': 'Searching web for "{q}"',
  'tool.action.webSearchGeneric': 'Searching the web',
  'tool.action.fetchPage': 'Fetching web page',
  'tool.action.execute': 'Executing {name}',

  'tool.range.steps': ' in steps {start}–{end}',
  'tool.range.after': 'after',
  'tool.range.before': 'before',

  // ---------------------------------------------- tool: memory compression --
  'tool.compress.range.one': 'step {n}',
  'tool.compress.range.many': 'steps {start}–{end}',
  'tool.compress.range.earlier': 'earlier steps',
  'tool.compress.failed': "Couldn't condense {range} yet; keeping the full record and retrying later",
  'tool.compress.retrying': 'Retrying the memory summary for {range}…',
  'tool.compress.held': 'Short memory for {range} is ready; keeping the full record until working memory fills up',
  'tool.compress.running': 'Condensing {range} into a short memory to free up room…',
  'tool.compress.recap': '{range} condensed into a recap to free up memory',
  'tool.compress.done': '{range} condensed into a short memory',
  'tool.compress.factor': ' ({factor}× smaller)',
  'tool.compress.tokenDelta': '{source} → {summary} tokens',
  'tool.compress.swapAt': '≈ {context} of {budget} tokens',
  'tool.compress.workingMemory': 'working memory ≈ {context} of {budget} tokens',
  'tool.compress.workingMemoryNoBudget': 'working memory ≈ {context} tokens',
  'tool.compress.phase.ready': 'Summary ready; kept in reserve until the context fills up',
  'tool.compress.phase.applied': 'Replaced this stretch with its summary',
  'tool.compress.phase.failed': 'Summary failed; full record kept',
  'tool.compress.phase.summarizing': 'Summarizing this stretch',

  // ------------------------------------------------------- tool: headings ---
  'tool.title.fallback': 'Tool Call',
  'tool.title.tap': 'Tapping Element',
  'tool.title.clickSequence': 'Executing Click Sequence',
  'tool.title.longPress': 'Long Pressing Element',
  'tool.title.enterText': 'Entering Text',
  'tool.title.swipeDir': 'Swiping Screen ({dir})',
  'tool.title.swipe': 'Swiping Screen',
  'tool.title.drag': 'Dragging Screen',
  'tool.title.pressKey': 'Pressing Hardware Key',
  'tool.title.launchApp': 'Launching Application',
  'tool.title.stopApp': 'Stopping Application',
  'tool.title.manageApp': 'Managing Application',
  'tool.title.waitDelay': 'Waiting for Delay',
  'tool.title.waitText': 'Waiting for Text',
  'tool.title.locate': 'Locating Elements',
  'tool.title.searchScreen': 'Searching on Screen',
  'tool.title.investigate': 'Investigating Issue',
  'tool.title.runCommand': 'Running System Command',
  'tool.title.webSearch': 'Web Search',
  'tool.title.fetchPage': 'Fetching Web Page',
  'tool.title.searchLogs': 'Searching Logs',
  'tool.title.analyzeLogs': 'Analyzing Logs',
  'tool.title.diagnose': 'Diagnosing Issue',
  'tool.title.analyzeRecording': 'Analyzing Screen Recording',
  'tool.title.cropSegment': 'Cropping Screen Recording',
  'tool.title.delegateVideo': 'Delegating Video Analysis',
  'tool.title.audioTrack': 'Analyzing Audio Track',

  // ------------------------------------------------------ tool: input label --
  'tool.target.byTarget': 'Element #{target}',
  'tool.target.byIndex': 'Element #{index}',
  'tool.input.fallback': 'Input',
  'tool.input.duration': 'Duration',
  'tool.input.direction': 'Direction',
  'tool.input.key': 'Key',
  'tool.input.text': 'Input Text',
  'tool.input.durationValue': 'Duration: {duration}ms',

  // ------------------------------------------------------- tool: failures ---
  'tool.error.toolFailed': 'Tool Failed',
  'tool.error.cannotFix': 'Status: cannot_fix',
  'tool.error.actionFailed': 'Action Failed',
  'common.unknownError': 'Unknown error',
};
