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

import { Component, signal, computed, effect, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AgentService } from '../../services/agent.service';
import { SystemService } from '../../services/system.service';
import { t } from '../../core/i18n/runtime';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { I18nService } from '../../core/i18n/i18n.service';
import {
  AdbServerConnectionResult,
  AdbServerDevice,
  DeviceInfo,
  ProbeResult,
  ProbeStatus
} from '../../core/models/system.model';
import {
  AppReference,
  SmartSuggestion,
  SuggestionCategory
} from '../../core/data/smart-tasks.data';
import { TaskRecommendationService } from '../../core/services/task-recommendation.service';
import {
  DEFAULT_EXPLORER_MODE,
  DEFAULT_VERIFICATION_LEVEL,
  EXPLORER_MODES,
  ExplorerModeId,
  TuningLevel,
  VERIFICATION_LEVELS,
  VerificationLevelId,
  levelIndex,
  notchPercent
} from '../../core/models/pro-tuning.model';

export type TuningKind = 'verify' | 'explore';

/** One 2x2 px square of the "maxed out" dither texture drawn over a slider rail. */
export interface DitherPixel {
  /** Horizontal position as a percentage of the rail width. */
  x: number;
  /** Row offset in px (rail is 6 px tall, three 2 px rows). */
  y: number;
  /** Resting opacity; squares near the thumb are stronger. */
  opacity: number;
  /** Animation delay in ms so the texture spreads leftwards from the thumb. */
  delay: number;
}

/**
 * Seeded pixels keep the slider texture stable across renders.
 * Delays increase with distance from the thumb to animate from right to left.
 */
function buildDitherPixels(count = 260, seed = 7): DitherPixel[] {
  let state = seed >>> 0;
  const rand = (): number => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  const pixels: DitherPixel[] = [];
  for (let i = 0; i < count; i++) {
    const x = rand() * 100;
    const y = Math.floor(rand() * 3) * 2;
    pixels.push({
      x: Math.round(x * 10) / 10,
      y,
      opacity: Math.round((0.35 + 0.4 * rand()) * 100) / 100,
      // 8 ms per percent: the front takes ~0.8 s to reach the left end.
      delay: Math.round((100 - x) * 8)
    });
  }
  return pixels;
}

/** Shared view model for the verification and screen-reading sliders. */
export interface TuningSliderVm {
  kind: TuningKind;
  /** Message key for the slider title. */
  nameKey: string;
  /** Message keys for the one-word meaning of each end of the track. */
  endsKeys: readonly [string, string];
  ladder: readonly TuningLevel[];
  index: number;
  level: TuningLevel;
  /** 0..1 position of the thumb along the track. */
  fraction: number;
}

export type { AppReference, SmartSuggestion, SuggestionCategory };

type AdbGuideTab = 'emulator' | 'usb' | 'wifi' | 'remote';

/**
 * Localised subtitle keys per environment probe, keyed on the stable probe id
 * then the status. The backend `summary` literal is replaced by these keys so
 * the cards read in the active language instead of English data.
 */
const PROBE_SUMMARY_KEYS: Record<string, Partial<Record<ProbeStatus, string>>> = {
  system_config: { pass: 'ui.probe.summary.configValid' },
  toolchain: { pass: 'ui.probe.summary.toolchainReady' },
  gemini_api_key: { fail: 'ui.probe.summary.keyMissing' },
  vision_ocr_key: { pass: 'ui.probe.summary.ocrNotConfigured' },
};


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  public agentService = inject(AgentService);
  public systemService = inject(SystemService);
  public taskRecService = inject(TaskRecommendationService);
  public i18n = inject(I18nService);
  private router = inject(Router);

  // High-level navigation mode: 'diagnostics' (System Setup Guide) vs 'launcher' (Task Execution)
  public activeTab = signal<'diagnostics' | 'launcher'>('launcher');

  // Interactive guide sub-tab inside the ADB section
  public activeAdbGuideTab = signal<AdbGuideTab>('emulator');
  public emulatorSetupMode = signal<'studio' | 'cli'>('studio');

  // Interactive guide tab for LLM / OCR credentials: 'gemini' | 'ocr'
  public modelSetupMode = signal<'gemini' | 'custom'>('gemini');
  public showOcrConfig = signal<boolean>(false);
  public showFullConfigFile = signal<boolean>(false);

  // Model & Environment configuration from backend
  public modelConfigEnv = computed(() => this.systemService.modelConfigEnv());

  // Google Gemini API Key State
  public geminiKeyInput = signal<string>('');
  public showGeminiKey = signal<boolean>(false);
  public isSavingGeminiKey = signal<boolean>(false);
  public isTestingGeminiKey = signal<boolean>(false);
  public geminiSaveMessage = signal<string | null>(null);
  public geminiSaveError = signal<string | null>(null);
  public isGeminiKeyEdited = signal<boolean>(false);

  // Vision OCR API Key State
  public ocrKeyInput = signal<string>('');
  public showOcrKey = signal<boolean>(false);
  public isSavingOcrKey = signal<boolean>(false);
  public isTestingOcrKey = signal<boolean>(false);
  public ocrSaveMessage = signal<string | null>(null);
  public ocrSaveError = signal<string | null>(null);
  public isOcrKeyEdited = signal<boolean>(false);

  // Custom OpenAI-compatible model state (Base URL + model + key)
  public customBaseUrlInput = signal<string>('');
  public customModelInput = signal<string>('');
  public customApiKeyInput = signal<string>('');
  public showCustomApiKey = signal<boolean>(false);
  public isSavingCustomModel = signal<boolean>(false);
  public customModelMessage = signal<string | null>(null);
  public customModelError = signal<string | null>(null);

  // Clipboard copy state tracker for interactive feedback
  public copiedId = signal<string | null>(null);

  // Diagnostic re-check state
  public isRefreshingDiagnostics = signal<boolean>(false);

  // Wireless ADB Interactive connection signals
  public wifiHost = signal<string>('192.168.1.100');
  public wifiPort = signal<string>('5555');
  public isConnectingWifi = signal<boolean>(false);
  public wifiConnectMessage = signal<string | null>(null);
  public wifiConnectError = signal<string | null>(null);
  public adbRestartFeedback = signal<string | null>(null);
  public showConnectionMethods = signal<boolean>(false);

  // ADB server endpoint connection state
  public remoteAdbHost = signal<string>('127.0.0.1');
  public remoteAdbPort = signal<string>('5038');
  public rememberRemoteAdb = signal<boolean>(true);
  public isConnectingRemoteAdb = signal<boolean>(false);
  public isActivatingRemoteAdb = signal<boolean>(false);
  public isSwitchingToLocalAdb = signal<boolean>(false);
  public remoteAdbMessage = signal<string | null>(null);
  public remoteAdbError = signal<string | null>(null);
  public remoteAdbDevices = signal<AdbServerDevice[]>([]);
  public remoteAdbProbeResult = signal<AdbServerConnectionResult | null>(null);
  public adbServerStatus = computed(() => this.systemService.adbServerStatus());
  public isRemoteAdbServer = computed(() => this.systemService.isRemoteAdbServer());
  public remoteAdbHasReadyDevice = computed(() =>
    this.remoteAdbDevices().some(device => device.state === 'device')
  );
  public isProbedRemoteAdbActive = computed(() => {
    const tested = this.remoteAdbProbeResult()?.endpoint;
    const active = this.adbServerStatus()?.endpoint;
    return !!tested && !!active && tested.identity === active.identity;
  });

  public wifiCommand = computed(() => {
    const h = this.wifiHost().trim() || '<phone-ip>';
    const p = this.wifiPort().trim() || '5555';
    return `adb connect ${h}:${p}`;
  });

  // Task execution parameters
  public selectedProfile = signal<'flash' | 'pro'>('flash');
  public taskGoal = signal<string>('');
  public isSubmitting = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  // Pro Mode Outputter & Structured Output Configuration
  public expectedOutput = signal<string>('');
  public enableOutputter = signal<boolean>(true);
  public showOutputterDrawer = signal<boolean>(false);

  // Slider indexes map to the API ids in VERIFICATION_LEVELS / EXPLORER_MODES.
  public readonly verificationLevels = VERIFICATION_LEVELS;
  public readonly explorerModes = EXPLORER_MODES;
  public verificationIndex = signal<number>(
    levelIndex(VERIFICATION_LEVELS, DEFAULT_VERIFICATION_LEVEL, DEFAULT_VERIFICATION_LEVEL)
  );
  public explorerIndex = signal<number>(
    levelIndex(EXPLORER_MODES, DEFAULT_EXPLORER_MODE, DEFAULT_EXPLORER_MODE)
  );
  /** Effective defaults from the backend config (`GET /api/run/defaults`). */
  private tuningDefaults = signal<{ verification: VerificationLevelId; explorer: ExplorerModeId }>({
    verification: DEFAULT_VERIFICATION_LEVEL,
    explorer: DEFAULT_EXPLORER_MODE
  });
  /** True once the user moved a slider; backend defaults then stop overriding it. */
  private tuningTouched = signal<boolean>(false);
  /** Which slider's hover card is open (while hovering, dragging, or focused). */
  public activeTuningTip = signal<TuningKind | null>(null);
  /** Pixel cloud drawn over a rail once its slider reaches the last notch. */
  public readonly ditherPixels: readonly DitherPixel[] = buildDitherPixels();

  public verificationLevel = computed<TuningLevel<VerificationLevelId>>(
    () => VERIFICATION_LEVELS[this.verificationIndex()]
  );
  public explorerMode = computed<TuningLevel<ExplorerModeId>>(
    () => EXPLORER_MODES[this.explorerIndex()]
  );
  public isTuningDefault = computed<boolean>(() => {
    const d = this.tuningDefaults();
    return this.verificationLevel().id === d.verification && this.explorerMode().id === d.explorer;
  });
  public tuningSliders = computed<TuningSliderVm[]>(() => {
    const vi = this.verificationIndex();
    const ei = this.explorerIndex();
    return [
      {
        kind: 'verify',
        nameKey: 'tuning.slider.verify.name',
        endsKeys: ['tuning.slider.verify.endLow', 'tuning.slider.verify.endHigh'],
        ladder: VERIFICATION_LEVELS,
        index: vi,
        level: VERIFICATION_LEVELS[vi],
        fraction: notchPercent(vi, VERIFICATION_LEVELS.length) / 100
      },
      {
        kind: 'explore',
        nameKey: 'tuning.slider.explore.name',
        endsKeys: ['tuning.slider.explore.endLow', 'tuning.slider.explore.endHigh'],
        ladder: EXPLORER_MODES,
        index: ei,
        level: EXPLORER_MODES[ei],
        fraction: notchPercent(ei, EXPLORER_MODES.length) / 100
      }
    ];
  });

  public notchFraction(index: number, count: number): number {
    return notchPercent(index, count) / 100;
  }

  public setTuningIndex(kind: TuningKind, raw: number | string): void {
    const idx = Math.round(Number(raw));
    if (!Number.isFinite(idx)) return;
    const ladder = kind === 'verify' ? VERIFICATION_LEVELS : EXPLORER_MODES;
    const clamped = Math.min(Math.max(idx, 0), ladder.length - 1);
    this.tuningTouched.set(true);
    if (kind === 'verify') {
      this.verificationIndex.set(clamped);
    } else {
      this.explorerIndex.set(clamped);
    }
    // Keyboard nudges and drags should keep the explanation visible.
    this.activeTuningTip.set(kind);
  }

  public showTuningTip(kind: TuningKind): void {
    this.activeTuningTip.set(kind);
  }

  public hideTuningTip(kind: TuningKind): void {
    if (this.activeTuningTip() === kind) {
      this.activeTuningTip.set(null);
    }
  }

  public resetTuning(): void {
    const d = this.tuningDefaults();
    this.verificationIndex.set(levelIndex(VERIFICATION_LEVELS, d.verification, DEFAULT_VERIFICATION_LEVEL));
    this.explorerIndex.set(levelIndex(EXPLORER_MODES, d.explorer, DEFAULT_EXPLORER_MODE));
    this.tuningTouched.set(false);
  }

  /** Pull the effective config defaults so the sliders start where artemis.jsonc is. */
  private loadProTuningDefaults(): void {
    this.agentService.getProTuningDefaults().subscribe({
      next: (res) => {
        const vIdx = levelIndex(VERIFICATION_LEVELS, res?.verification_level, DEFAULT_VERIFICATION_LEVEL);
        const eIdx = levelIndex(EXPLORER_MODES, res?.explorer_mode, DEFAULT_EXPLORER_MODE);
        this.tuningDefaults.set({
          verification: VERIFICATION_LEVELS[vIdx].id,
          explorer: EXPLORER_MODES[eIdx].id
        });
        if (!this.tuningTouched()) {
          this.verificationIndex.set(vIdx);
          this.explorerIndex.set(eIdx);
        }
      },
      // Defaults are a convenience; the built-in ladder defaults already apply.
      error: () => undefined
    });
  }

  public toggleOutputterDrawer(): void {
    this.showOutputterDrawer.update((v) => !v);
  }

  public applyOutputPreset(preset: string): void {
    if (this.expectedOutput() === preset) {
      this.expectedOutput.set('');
    } else {
      this.expectedOutput.set(preset);
      this.showOutputterDrawer.set(true);
    }
  }

  // Smart intent detection for model recommendation
  public isIntentSuggestingPro = computed<boolean>(() => {
    const text = this.taskGoal().toLowerCase();
    if (!text.trim()) return false;
    const keywords = [
      'monitor', 'polling', 'poll', 'wait until', 'loop', 'keep watching',
      'crash', 'logcat', 'troubleshoot', 'diagnose', 'debug', 'investigate',
      'compare', 'extract', 'summarize', 'report',
      // CJK keywords are match literals, not UI copy: they detect monitoring
      // intent in a Chinese task prompt, so they stay identical in every
      // locale and must not be routed through the message tables.
      '监控', '轮询', '等待', '一直', '直到', '崩溃', '闪退', '排查', '分析日志', '对比', '总结'
    ];
    return keywords.some(k => text.includes(k));
  });

  public showIntentSuggestion = computed<boolean>(() => {
    return this.isIntentSuggestingPro() && this.selectedProfile() === 'flash';
  });

  // Computed helper states delegating to SystemService
  public isReady = computed(() => this.systemService.isReady());
  public hasReadinessReport = computed(() => this.systemService.hasReadinessReport());
  public isLoading = computed(() => this.systemService.isLoading());
  public isRestartingAdb = computed(() => this.systemService.isRestartingAdb());
  public launchingAvd = computed(() => this.systemService.launchingAvd());
  public emulatorLaunchState = computed(() => this.systemService.emulatorLaunchState());
  public isEmulatorLaunching = computed(() => this.systemService.isEmulatorLaunching());
  public showLaunchLogs = signal<boolean>(false);
  
  // Probes
  public pythonProbe = computed(() => this.systemService.pythonProbe());
  public configProbe = computed(() => this.systemService.configProbe());
  public adbProbe = computed(() => this.systemService.adbProbe());
  public llmProbe = computed(() => this.systemService.llmProbe());
  public geminiProbe = computed(() => this.systemService.geminiProbe());
  public ocrProbe = computed(() => this.systemService.ocrProbe());
  public toolchainProbe = computed(() => this.systemService.toolchainProbe());

  /**
   * Stable code describing the local ADB device state.
   *
   * The backend exposes this only as a human-facing English `summary` (e.g.
   * "Device Booting"). The template previously branched on those literal
   * strings, which would break once `summary` is localised. Map it once to a
   * stable code here and branch on the code instead.
   */
  public adbState(): 'booting' | 'locked' | 'lockUnknown' | 'unauthorized' | 'none' {
    const s = this.adbProbe()?.summary ?? '';
    if (s === 'Device Booting') return 'booting';
    if (s === 'Device Locked') return 'locked';
    if (s === 'Lock State Unknown') return 'lockUnknown';
    if (s === 'Device Unauthorized') return 'unauthorized';
    return 'none';
  }

  /** Localised card subtitle for an environment probe, keyed on stable id. */
  public probeSummaryLabel(probe: ProbeResult | null): string {
    if (!probe) return this.i18n.t('ui.checking2');
    if (probe.status === 'fail' && probe.id !== 'android_adb') {
      const failKey = PROBE_SUMMARY_KEYS[probe.id]?.fail;
      if (failKey) return this.i18n.t(failKey);
    }
    if (probe.id === 'python_runtime') {
      if (probe.status === 'pass') {
        const version = probe.metadata?.['version'];
        return this.i18n.t('ui.probe.summary.pythonReady', {
          version: typeof version === 'string' && version ? version : '',
        });
      }
      return probe.summary || this.i18n.t('ui.checking2');
    }
    if (probe.id === 'android_adb') {
      const stateKey: Record<string, string> = {
        locking: 'ui.probe.summary.deviceLocked',
        lockUnknown: 'ui.probe.summary.lockStateUnknown',
        unauthorized: 'ui.probe.summary.deviceUnauthorized',
        booting: 'ui.probe.summary.deviceBooting',
      };
      return this.i18n.t(stateKey[this.adbState()] ?? 'ui.probe.summary.deviceLocked');
    }
    const passKey = PROBE_SUMMARY_KEYS[probe.id]?.pass;
    if (passKey) return this.i18n.t(passKey);
    return probe.summary || this.i18n.t('ui.checking2');
  }

  /**
   * Localised device-state description. The full backend description is long
   * and carries dynamic paths/serials, so the localised text is a stable
   * sentence that still tells the user about the lock state.
   */
  public adbDescription(): string {
    const state = this.adbState();
    if (state === 'locked') return this.i18n.t('ui.probe.desc.deviceLocked');
    if (state === 'lockUnknown') return this.i18n.t('ui.probe.desc.lockStateUnknown');
    if (state === 'unauthorized') return this.i18n.t('ui.probe.desc.deviceUnauthorized');
    if (state === 'booting') return this.i18n.t('ui.probe.desc.deviceBooting');
    return this.adbProbe()?.description ?? '';
  }

  // Step-level readiness
  public isEnvironmentReady = computed(() => this.systemService.isEnvironmentReady());
  public isCredentialsReady = computed(() => this.systemService.isCredentialsReady());
  public isSkipCredentialsCheck = computed(() => this.systemService.isSkipCredentialsCheck());
  public isDeviceReady = computed(() => this.systemService.isDeviceReady());

  // Device information
  public activeDevice = computed(() => this.systemService.activeDevice());
  public connectedDevices = computed(() => this.systemService.connectedDevices());
  public installedAvds = computed(() => this.systemService.installedAvds());
  public emulatorPath = computed(() => this.systemService.emulatorPath());
  public isEmulatorInPath = computed(() => this.systemService.isEmulatorInPath());
  public totalStepCount = computed(() => this.systemService.totalStepCount());
  public passedStepCount = computed(() => this.systemService.passedStepCount());
  public blockerCount = computed(() => this.systemService.blockerCount());
  public passedBlockerCount = computed(() => this.systemService.passedBlockerCount());

  // Configured LLM providers from probe metadata
  public configuredLlmProviders = computed<any[]>(() => {
    const meta = this.llmProbe()?.metadata;
    if (meta && Array.isArray(meta['providers'])) {
      return meta['providers'];
    }
    return [];
  });

  // Multi-OS detection & active OS selection
  public selectedOs = signal<'linux' | 'darwin' | 'windows' | null>(null);
  public effectiveOs = computed<'linux' | 'darwin' | 'windows'>(() => {
    return this.selectedOs() || this.systemService.osType();
  });

  public oneClickSetupCmd = computed(() => {
    const os = this.effectiveOs();
    if (os === 'windows') {
      return 'powershell -ExecutionPolicy Bypass -File scripts/install_deps.ps1';
    }
    return 'bash scripts/install_deps.sh';
  });

  public adbInstallCmd = computed(() => {
    const os = this.effectiveOs();
    if (os === 'windows') {
      return 'winget install Google.PlatformTools';
    }
    if (os === 'darwin') {
      return 'brew install android-platform-tools';
    }
    return 'sudo apt-get install -y adb';
  });

  public toolchainInstallCmd = computed(() => {
    const os = this.effectiveOs();
    if (os === 'windows') {
      return 'winget install Gyan.FFmpeg Genymobile.scrcpy';
    }
    if (os === 'darwin') {
      return 'brew install ffmpeg scrcpy';
    }
    return 'sudo apt-get install -y ffmpeg scrcpy';
  });

  public emuHypervisorTitle = computed(() => {
    const os = this.effectiveOs();
    if (os === 'windows') return t('setup.hypervisor.windows');
    if (os === 'darwin') return t('setup.hypervisor.darwin');
    return t('setup.hypervisor.linux');
  });

  public emuHypervisorDesc = computed(() => {
    const os = this.effectiveOs();
    if (os === 'windows') return t('setup.hypervisor.windowsCmd');
    if (os === 'darwin') return t('setup.hypervisor.darwinCmd');
    return t('setup.hypervisor.linuxCmd');
  });

  public emuHypervisorCmd = computed(() => {
    const os = this.effectiveOs();
    if (os === 'windows') return 'Enable-WindowsOptionalFeature -Online -FeatureName HypervisorPlatform';
    if (os === 'darwin') return 'brew install --cask android-commandlinetools';
    return 'sudo apt-get install -y qemu-kvm libvirt-daemon-system && sudo adduser $USER kvm';
  });

  public emuSdkInstallCmd = computed(() => {
    const os = this.effectiveOs();
    if (os === 'darwin') {
      return 'sdkmanager --install "system-images;android-34;google_apis;arm64-v8a" "emulator" "platform-tools"';
    }
    return 'sdkmanager --install "system-images;android-34;google_apis;x86_64" "emulator" "platform-tools"';
  });

  public emuCreateAvdCmd = computed(() => {
    const os = this.effectiveOs();
    if (os === 'darwin') {
      return 'avdmanager create avd -n Pixel_8_API_34 -k "system-images;android-34;google_apis;arm64-v8a" --device "pixel_8"';
    }
    return 'avdmanager create avd -n Pixel_8_API_34 -k "system-images;android-34;google_apis;x86_64" --device "pixel_8"';
  });

  // Flag indicating whether Google Cloud Vision OCR is configured
  public isOcrConfigured = computed<boolean>(() => {
    const meta = this.ocrProbe()?.metadata;
    return meta?.['configured'] === true;
  });

  public currentApiKey = computed<string>(() => this.systemService.currentApiKey());
  public apiKeysMap = computed<Record<string, string>>(() => this.systemService.apiKeysMap());

  public savedGeminiKey = computed<string>(() => {
    const keys = this.apiKeysMap();
    return keys['google'] || this.currentApiKey() || '';
  });

  public isGeminiModified = computed<boolean>(() => {
    return this.geminiKeyInput().trim() !== this.savedGeminiKey().trim();
  });

  public savedOcrKey = computed<string>(() => {
    const keys = this.apiKeysMap();
    return keys['ocr'] || '';
  });

  public isOcrModified = computed<boolean>(() => {
    return this.ocrKeyInput().trim() !== this.savedOcrKey().trim();
  });

  // Rich Smart Suggestions Library (Device-Aware, Flash vs Pro Tailored)
  public readonly allSuggestions = this.taskRecService.allTasks;

  // Suggestion category filter & shuffle state
  public selectedCategory = signal<SuggestionCategory>('all');
  public shuffleOffset = signal<number>(0);

  // Set of installed package strings from active device
  public installedPackages = computed<Set<string>>(() => {
    const pkgs = this.activeDevice()?.installed_packages;
    if (pkgs && Array.isArray(pkgs)) {
      return new Set(pkgs);
    }
    return new Set();
  });

  public filteredSuggestions = computed<SmartSuggestion[]>(() => {
    return this.taskRecService.filterAndRankTasks(
      this.installedPackages(),
      this.selectedCategory(),
      this.shuffleOffset()
    );
  });




  private focusListener = () => {
    // Silently re-check environment when user returns to the browser tab
    this.systemService.fetchReadiness().subscribe();
  };

  constructor() {
    effect(() => {
      const keys = this.systemService.apiKeysMap();
      const current = this.systemService.currentApiKey();
      const googleKey = keys['google'] || current || '';
      const ocrKey = keys['ocr'] || '';
      if (!this.isGeminiKeyEdited()) {
        this.geminiKeyInput.set(googleKey);
      }
      if (!this.isOcrKeyEdited()) {
        this.ocrKeyInput.set(ocrKey);
      }
    });
  }

  ngOnInit(): void {

    this.loadProTuningDefaults();
    // Initial fetch of system readiness & model configuration
    this.systemService.fetchReadiness().subscribe();
    this.systemService.fetchModelConfigEnv().subscribe();
    this.systemService.fetchAdbServerStatus().subscribe({
      next: status => {
        if (status.endpoint.mode === 'remote') {
          this.remoteAdbHost.set(status.endpoint.host);
          this.remoteAdbPort.set(String(status.endpoint.port));
          this.activeAdbGuideTab.set('remote');
        }
      },
      error: () => {}
    });

    window.addEventListener('focus', this.focusListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('focus', this.focusListener);
  }

  public setTab(tab: 'diagnostics' | 'launcher'): void {
    this.activeTab.set(tab);
    if (tab === 'diagnostics') {
      this.systemService.fetchReadiness().subscribe();
      this.systemService.fetchModelConfigEnv().subscribe();
    }
  }

  public setSelectedOs(os: 'linux' | 'darwin' | 'windows'): void {
    this.selectedOs.set(os);
  }

  public setAdbGuideTab(tab: AdbGuideTab): void {
    this.activeAdbGuideTab.set(tab);
    this.remoteAdbError.set(null);
    this.remoteAdbMessage.set(null);
  }

  public setEmulatorSetupMode(mode: 'studio' | 'cli'): void {
    this.emulatorSetupMode.set(mode);
  }

  public setModelSetupMode(mode: 'gemini' | 'custom'): void {
    this.modelSetupMode.set(mode);
    if (mode === 'custom') {
      this.systemService.setSkipCredentialsCheck(true);
      this.systemService.fetchModelConfigEnv().subscribe();
    } else {
      this.systemService.setSkipCredentialsCheck(false);
    }
  }

  public toggleFullConfigFile(): void {
    this.showFullConfigFile.update(v => !v);
  }

  public toggleGeminiKeyVisibility(): void {
    this.showGeminiKey.update(v => !v);
  }

  public toggleOcrKeyVisibility(): void {
    this.showOcrKey.update(v => !v);
  }

  public toggleOcrConfig(): void {
    this.showOcrConfig.update(v => !v);
  }

  public onGeminiKeyChange(val: string): void {
    this.geminiKeyInput.set(val);
    this.isGeminiKeyEdited.set(true);
    this.geminiSaveError.set(null);
    this.geminiSaveMessage.set(null);
  }

  public onOcrKeyChange(val: string): void {
    this.ocrKeyInput.set(val);
    this.isOcrKeyEdited.set(true);
    this.ocrSaveError.set(null);
    this.ocrSaveMessage.set(null);
  }

  public saveGeminiKey(): void {
    const key = this.geminiKeyInput().trim();
    if (!key) return;
    this.isSavingGeminiKey.set(true);
    this.geminiSaveError.set(null);
    this.geminiSaveMessage.set(null);

    this.systemService.updateApiKey('google', key, true).subscribe({
      next: (res) => {
        this.isSavingGeminiKey.set(false);
        this.isGeminiKeyEdited.set(false);
        this.geminiSaveMessage.set(res?.message || '✓ Gemini API key verified & saved successfully.');
        setTimeout(() => this.geminiSaveMessage.set(null), 5000);
      },
      error: (err) => {
        this.isSavingGeminiKey.set(false);
        this.geminiSaveError.set(err?.error?.detail || err?.message || t('setup.gemini.saveFailed'));
      }
    });
  }

  public clearGeminiKey(): void {
    this.geminiKeyInput.set('');
    this.isGeminiKeyEdited.set(false);
    this.geminiSaveError.set(null);
    this.geminiSaveMessage.set(null);

    if (this.savedGeminiKey().trim()) {
      this.isSavingGeminiKey.set(true);
      this.systemService.updateApiKey('google', '', true).subscribe({
        next: (res) => {
          this.isSavingGeminiKey.set(false);
          this.geminiSaveMessage.set(res?.message || '✓ Gemini API key cleared.');
          setTimeout(() => this.geminiSaveMessage.set(null), 5000);
        },
        error: (err) => {
          this.isSavingGeminiKey.set(false);
          this.geminiSaveError.set(err?.error?.detail || err?.message || t('setup.gemini.clearFailed'));
        }
      });
    } else {
      this.geminiSaveMessage.set('✓ Gemini API key cleared.');
      setTimeout(() => this.geminiSaveMessage.set(null), 3000);
    }
  }

  /**
   * Set a custom OpenAI-compatible endpoint as the default model from the Web UI.
   */
  public saveCustomModel(): void {
    const baseUrl = this.customBaseUrlInput().trim();
    const model = this.customModelInput().trim();
    const apiKey = this.customApiKeyInput().trim();
    if (!baseUrl || !model) {
      this.customModelError.set(
        t('ai.baseAndModelRequired') // "Base URL and model name are required."
      );
      return;
    }
    this.isSavingCustomModel.set(true);
    this.customModelError.set(null);
    this.customModelMessage.set(null);

    this.systemService.setCustomModel(baseUrl, model, apiKey, true).subscribe({
      next: (res) => {
        this.isSavingCustomModel.set(false);
        this.customModelMessage.set(
          res?.message || `✓ Custom model "${model}" is now the default.`
        );
        setTimeout(() => this.customModelMessage.set(null), 5000);
      },
      error: (err) => {
        this.isSavingCustomModel.set(false);
        this.customModelError.set(
          err?.error?.detail || err?.message || t('setup.gemini.saveFailed')
        );
      }
    });
  }

  public toggleCustomApiKeyVisibility(): void {
    this.showCustomApiKey.update((v) => !v);
  }

  public saveOcrKey(): void {
    const key = this.ocrKeyInput().trim();
    if (!key) return;
    this.isSavingOcrKey.set(true);
    this.ocrSaveError.set(null);
    this.ocrSaveMessage.set(null);

    this.systemService.updateApiKey('ocr', key, true).subscribe({
      next: (res) => {
        this.isSavingOcrKey.set(false);
        this.isOcrKeyEdited.set(false);
        this.ocrSaveMessage.set(res?.message || '✓ Vision OCR API key verified & saved.');
        setTimeout(() => this.ocrSaveMessage.set(null), 5000);
      },
      error: (err) => {
        this.isSavingOcrKey.set(false);
        this.ocrSaveError.set(err?.error?.detail || err?.message || t('setup.ocr.saveFailed'));
      }
    });
  }

  public clearOcrKey(): void {
    this.ocrKeyInput.set('');
    this.isOcrKeyEdited.set(false);
    this.ocrSaveError.set(null);
    this.ocrSaveMessage.set(null);

    if (this.savedOcrKey().trim()) {
      this.isSavingOcrKey.set(true);
      this.systemService.updateApiKey('ocr', '', true).subscribe({
        next: (res) => {
          this.isSavingOcrKey.set(false);
          this.ocrSaveMessage.set(res?.message || '✓ Vision OCR API key cleared.');
          setTimeout(() => this.ocrSaveMessage.set(null), 5000);
        },
        error: (err) => {
          this.isSavingOcrKey.set(false);
          this.ocrSaveError.set(err?.error?.detail || err?.message || t('setup.ocr.clearFailed'));
        }
      });
    } else {
      this.ocrSaveMessage.set('✓ Vision OCR API key cleared.');
      setTimeout(() => this.ocrSaveMessage.set(null), 3000);
    }
  }

  public testGeminiKey(): void {
    const key = this.geminiKeyInput().trim();
    if (!key) return;
    this.isTestingGeminiKey.set(true);
    this.geminiSaveError.set(null);
    this.geminiSaveMessage.set(null);

    this.systemService.testApiKey('google', key).subscribe({
      next: (res) => {
        this.isTestingGeminiKey.set(false);
        if (res?.valid) {
          this.geminiSaveMessage.set(res?.message || '✓ Gemini API key is valid!');
        } else {
          this.geminiSaveError.set(res?.message || 'Gemini API key verification failed.');
        }
        setTimeout(() => this.geminiSaveMessage.set(null), 5000);
      },
      error: (err) => {
        this.isTestingGeminiKey.set(false);
        this.geminiSaveError.set(err?.error?.detail || err?.message || 'Gemini API key test failed.');
      }
    });
  }

  public testOcrKey(): void {
    const key = this.ocrKeyInput().trim();
    if (!key) return;
    this.isTestingOcrKey.set(true);
    this.ocrSaveError.set(null);
    this.ocrSaveMessage.set(null);

    this.systemService.testApiKey('ocr', key).subscribe({
      next: (res) => {
        this.isTestingOcrKey.set(false);
        if (res?.valid) {
          this.ocrSaveMessage.set(res?.message || '✓ Vision OCR API key is valid!');
        } else {
          this.ocrSaveError.set(res?.message || 'Vision OCR API key verification failed.');
        }
        setTimeout(() => this.ocrSaveMessage.set(null), 5000);
      },
      error: (err) => {
        this.isTestingOcrKey.set(false);
        this.ocrSaveError.set(err?.error?.detail || err?.message || 'Vision OCR API key test failed.');
      }
    });
  }

  public getProviderDisplayName(tab: string): string {
    switch (tab) {
      case 'gemini': return 'Gemini';
      case 'ocr': return t('setup.ocr.title');
      default: return tab;
    }
  }

  public getProviderEnvVar(tab: string): string {
    switch (tab) {
      case 'gemini': return 'GEMINI_API_KEY';
      case 'ocr': return 'GOOGLE_VISION_API_KEY';
      default: return 'API_KEY';
    }
  }

  public getProviderHint(tab: string): string {
    switch (tab) {
      case 'gemini':
        return t('setup.ocr.hint');
      case 'ocr':
        return 'Google Cloud Vision API key for on-screen OCR text detection and UI grounding.';
      default:
        return t('setup.key.hint');
    }
  }

  public skipCredentialsCheck(): void {
    this.systemService.skipCredentialsCheck();
  }

  public getApiKeyPlaceholder(tab: string): string {
    switch (tab) {
      case 'gemini': return 'Enter Gemini API Key (e.g. AIzaSy...)';
      case 'ocr': return 'Enter Vision OCR API Key (e.g. AIzaSy...)';
      default: return 'Enter API Key...';
    }
  }

  public isTabProviderActive(tab: string): boolean {
    if (tab === 'ocr') {
      return this.isOcrConfigured();
    }
    const targetProvider = tab === 'gemini' ? 'google' : tab;
    const providers = this.configuredLlmProviders();
    return providers.some(p => p.provider === targetProvider);
  }

  public refreshReadiness(): void {
    this.isRefreshingDiagnostics.set(true);
    this.systemService.fetchReadiness(false, true).subscribe({
      next: () => {
        this.systemService.fetchModelConfigEnv().subscribe({
          next: () => {
            setTimeout(() => this.isRefreshingDiagnostics.set(false), 450);
          },
          error: () => this.isRefreshingDiagnostics.set(false)
        });
      },
      error: () => this.isRefreshingDiagnostics.set(false)
    });
  }

  public restartAdbServer(): void {
    this.adbRestartFeedback.set(null);
    this.systemService.restartAdb().subscribe({
      next: (res) => {
        this.adbRestartFeedback.set(
          res?.restart_result?.skipped ? 'Devices Refreshed ✓' : 'ADB Refreshed ✓'
        );
        setTimeout(() => this.adbRestartFeedback.set(null), 2500);
      },
      error: () => {
        this.adbRestartFeedback.set(t('setup.adb.restartFailed'));
        setTimeout(() => this.adbRestartFeedback.set(null), 3000);
      }
    });
  }

  public connectWifiDevice(): void {
    if (this.isRemoteAdbServer()) {
      this.wifiConnectError.set(t('setup.wifi.switchToLocal'));
      return;
    }
    const host = this.wifiHost().trim();
    const portStr = this.wifiPort().trim() || '5555';
    const port = parseInt(portStr, 10) || 5555;

    if (!host) {
      this.wifiConnectError.set(t('setup.wifi.invalidIp'));
      return;
    }

    this.isConnectingWifi.set(true);
    this.wifiConnectError.set(null);
    this.wifiConnectMessage.set(null);

    this.systemService.connectWirelessAdb(host, port).subscribe({
      next: (res) => {
        this.isConnectingWifi.set(false);
        const cr = res?.connect_result;
        if (cr?.success) {
          this.wifiConnectMessage.set(`Connected to ${host}:${port}!`);
          setTimeout(() => this.wifiConnectMessage.set(null), 4000);
        } else {
          this.wifiConnectError.set(cr?.message || 'Connection failed. Please check phone IP & Wi-Fi.');
        }
      },
      error: (err) => {
        this.isConnectingWifi.set(false);
        this.wifiConnectError.set(err?.error?.detail || t('setup.wifi.connectFailed'));
      }
    });
  }

  public connectRemoteAdbServer(): void {
    const host = this.remoteAdbHost().trim();
    const port = Number(this.remoteAdbPort().trim());

    if (!host) {
      this.remoteAdbError.set(t('setup.remoteAdb.hostRequired'));
      return;
    }
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      this.remoteAdbError.set(t('setup.remoteAdb.portRange'));
      return;
    }

    this.isConnectingRemoteAdb.set(true);
    this.remoteAdbError.set(null);
    this.remoteAdbMessage.set(null);
    this.remoteAdbDevices.set([]);
    this.remoteAdbProbeResult.set(null);

    this.systemService.probeAdbServer(host, port).subscribe({
      next: response => {
        this.isConnectingRemoteAdb.set(false);
        const result = response.connection_result;
        if (result.success) {
          this.remoteAdbProbeResult.set(result);
          this.remoteAdbDevices.set(result.devices || []);
          this.remoteAdbMessage.set(result.message);
        } else {
          this.remoteAdbError.set(result.message);
        }
      },
      error: error => {
        this.isConnectingRemoteAdb.set(false);
        this.remoteAdbError.set(
          error?.error?.detail || t('setup.remoteAdb.testFailed')
        );
      }
    });
  }

  public activateRemoteAdbServer(): void {
    const tested = this.remoteAdbProbeResult();
    if (!tested?.success) {
      this.remoteAdbError.set(t('setup.remoteAdb.testFirst'));
      return;
    }

    this.isActivatingRemoteAdb.set(true);
    this.remoteAdbError.set(null);
    this.systemService.connectAdbServer(
      tested.endpoint.host,
      tested.endpoint.port,
      this.rememberRemoteAdb()
    ).subscribe({
      next: response => {
        this.isActivatingRemoteAdb.set(false);
        const result = response.connection_result;
        if (result.success) {
          this.remoteAdbProbeResult.set(result);
          this.remoteAdbDevices.set(result.devices || []);
          this.remoteAdbMessage.set(result.message);
        } else {
          this.remoteAdbError.set(result.message);
        }
      },
      error: error => {
        this.isActivatingRemoteAdb.set(false);
        this.remoteAdbError.set(
          error?.error?.detail || t('setup.remoteAdb.useFailed')
        );
      }
    });
  }

  public updateRemoteAdbHost(value: string): void {
    this.remoteAdbHost.set(value);
    this.clearRemoteAdbProbe();
  }

  public updateRemoteAdbPort(value: string): void {
    this.remoteAdbPort.set(value);
    this.clearRemoteAdbProbe();
  }

  private clearRemoteAdbProbe(): void {
    this.remoteAdbProbeResult.set(null);
    this.remoteAdbDevices.set([]);
    this.remoteAdbMessage.set(null);
    this.remoteAdbError.set(null);
  }

  public switchToLocalAdbServer(): void {
    this.isSwitchingToLocalAdb.set(true);
    this.remoteAdbError.set(null);
    this.systemService.useLocalAdbServer(true).subscribe({
      next: response => {
        this.isSwitchingToLocalAdb.set(false);
        this.remoteAdbDevices.set([]);
        this.remoteAdbMessage.set(response.connection_result.message);
      },
      error: error => {
        this.isSwitchingToLocalAdb.set(false);
        this.remoteAdbError.set(
          error?.error?.detail || t('setup.remoteAdb.switchFailed')
        );
      }
    });
  }

  public toggleConnectionMethods(): void {
    this.showConnectionMethods.update(value => !value);
  }

  public launchAvdEmulator(avdName: string): void {
    if (this.isRemoteAdbServer()) {
      return;
    }
    this.systemService.launchEmulator(avdName).subscribe();
  }

  public toggleLaunchLogs(): void {
    this.showLaunchLogs.update(v => !v);
  }

  public stopEmulator(): void {
    this.systemService.stopEmulator().subscribe();
  }

  public dismissEmulatorStatus(): void {
    this.systemService.dismissEmulatorStatus().subscribe();
  }

  public selectTargetDevice(serial: string): void {
    this.systemService.selectDevice(serial).subscribe();
  }

  public getEmulatorCommand(avdName: string): string {
    const p = this.emulatorPath();
    const cmd = this.isEmulatorInPath() ? 'emulator' : (p || '~/Android/Sdk/emulator/emulator');
    return `${cmd} -avd ${avdName}`;
  }

  public copyToClipboard(text: string, id: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.copiedId.set(id);
        setTimeout(() => {
          if (this.copiedId() === id) {
            this.copiedId.set(null);
          }
        }, 2000);
      });
    }
  }

  public setProfile(profile: 'flash' | 'pro'): void {
    this.selectedProfile.set(profile);
  }

  public setCategory(cat: SuggestionCategory): void {
    this.selectedCategory.set(cat);
  }

  public shuffleSuggestions(): void {
    this.shuffleOffset.update(v => v + 3);
  }

  public getAppNamesDisplay(apps: AppReference[]): string {
    return apps.map((a) => this.i18n.t(a.nameKey)).join(' + ');
  }

  public applySuggestion(item: SmartSuggestion): void {
    this.taskGoal.set(this.i18n.t(item.goalKey));
    this.selectedProfile.set(item.profile);
    this.errorMessage.set(null);
  }

  public applyQuickPrompt(promptGoal: string, profile?: 'flash' | 'pro'): void {
    this.taskGoal.set(promptGoal);
    if (profile) {
      this.selectedProfile.set(profile);
    }
    this.errorMessage.set(null);
  }


  public proceedToLauncher(): void {
    this.activeTab.set('launcher');
  }

  public runTask(): void {
    const goal = this.taskGoal().trim();
    if (!goal) {
      this.errorMessage.set(t('task.goalRequired'));
      return;
    }

    if (!this.isReady()) {
      this.errorMessage.set(t('task.prereqMissing'));
      this.activeTab.set('diagnostics');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.agentService
      .runTask(
        goal,
        this.selectedProfile(),
        this.selectedProfile() === 'pro' && this.expectedOutput().trim()
          ? this.expectedOutput().trim()
          : undefined,
        this.selectedProfile() === 'pro' ? this.enableOutputter() : undefined,
        this.selectedProfile() === 'pro'
          ? { verificationLevel: this.verificationLevel().id, explorerMode: this.explorerMode().id }
          : undefined
      )
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/workspace']);
        },
        error: (err) => {
          console.error('Failed to submit task from home page:', err);
          this.isSubmitting.set(false);
          this.errorMessage.set(
            err?.error?.detail || t('task.submitFailed')
          );
        }
      });
  }
}
