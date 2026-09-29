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

export interface AppReference {
  /** Message key for the localised app name. */
  nameKey: string;
  icon: string;
  pkg?: string;
  category?: string;
}

export type SuggestionCategory =
  | 'all'
  | 'flash'
  | 'pro'
  | 'cross_app'
  | 'monitor';

export interface SmartSuggestion {
  id: string;
  /** Message keys for the display text; resolved by the launcher templates. */
  titleKey: string;
  descriptionKey: string;
  goalKey: string;
  profile: 'flash' | 'pro';
  category: 'flash' | 'pro' | 'cross_app' | 'monitor';
  tagKey: string;
  apps: AppReference[];
  requiredPackages?: string[];
  matchMode?: 'any' | 'all';
  priority?: number;
}

/**
 * Recognized Android App Package Registry
 */
export const APP_REGISTRY: Record<string, AppReference> = {
  // Google Suite & System
  'com.google.android.apps.maps': { nameKey: 'app.com.google.android.apps.maps.name', icon: 'explore', pkg: 'com.google.android.apps.maps', category: 'navigation' },
  'com.google.android.gm': { nameKey: 'app.com.google.android.gm.name', icon: 'mail', pkg: 'com.google.android.gm', category: 'productivity' },
  'com.android.chrome': { nameKey: 'app.com.android.chrome.name', icon: 'public', pkg: 'com.android.chrome', category: 'browser' },
  'com.google.android.youtube': { nameKey: 'app.com.google.android.youtube.name', icon: 'smart_display', pkg: 'com.google.android.youtube', category: 'entertainment' },
  'com.android.settings': { nameKey: 'app.com.android.settings.name', icon: 'settings', pkg: 'com.android.settings', category: 'system' },
  'com.google.android.deskclock': { nameKey: 'app.com.google.android.deskclock.name', icon: 'timer', pkg: 'com.google.android.deskclock', category: 'utility' },
  'com.android.deskclock': { nameKey: 'app.com.android.deskclock.name', icon: 'timer', pkg: 'com.android.deskclock', category: 'utility' },
  'com.google.android.calculator': { nameKey: 'app.com.google.android.calculator.name', icon: 'calculate', pkg: 'com.google.android.calculator', category: 'utility' },
  'com.android.calculator2': { nameKey: 'app.com.android.calculator2.name', icon: 'calculate', pkg: 'com.android.calculator2', category: 'utility' },
  'com.google.android.apps.photos': { nameKey: 'app.com.google.android.apps.photos.name', icon: 'photo_library', pkg: 'com.google.android.apps.photos', category: 'media' },
  'com.google.android.calendar': { nameKey: 'app.com.google.android.calendar.name', icon: 'calendar_month', pkg: 'com.google.android.calendar', category: 'productivity' },
  'com.google.android.keep': { nameKey: 'app.com.google.android.keep.name', icon: 'note_alt', pkg: 'com.google.android.keep', category: 'productivity' },
  'com.android.vending': { nameKey: 'app.com.android.vending.name', icon: 'storefront', pkg: 'com.android.vending', category: 'tools' },
  'com.google.android.apps.messaging': { nameKey: 'app.com.google.android.apps.messaging.name', icon: 'chat', pkg: 'com.google.android.apps.messaging', category: 'communication' },

  // Popular Ecosystem Apps
  'com.tencent.mm': { nameKey: 'app.com.tencent.mm.name', icon: 'forum', pkg: 'com.tencent.mm', category: 'social' },
  'com.xingin.xhs': { nameKey: 'app.com.xingin.xhs.name', icon: 'auto_stories', pkg: 'com.xingin.xhs', category: 'social' },
  'com.sankuai.meituan': { nameKey: 'app.com.sankuai.meituan.name', icon: 'restaurant', pkg: 'com.sankuai.meituan', category: 'lifestyle' },
  'com.dianping.v1': { nameKey: 'app.com.dianping.v1.name', icon: 'star', pkg: 'com.dianping.v1', category: 'lifestyle' },
  'tv.danmaku.bili': { nameKey: 'app.tv.danmaku.bili.name', icon: 'video_library', pkg: 'tv.danmaku.bili', category: 'entertainment' },
  'com.eg.android.AlipayGphone': { nameKey: 'app.com.eg.android.AlipayGphone.name', icon: 'account_balance_wallet', pkg: 'com.eg.android.AlipayGphone', category: 'finance' },
  'com.netease.cloudmusic': { nameKey: 'app.com.netease.cloudmusic.name', icon: 'headphones', pkg: 'com.netease.cloudmusic', category: 'entertainment' },
  'com.spotify.music': { nameKey: 'app.com.spotify.music.name', icon: 'music_note', pkg: 'com.spotify.music', category: 'entertainment' }
};

/**
 * Curated, clean task preset library (1~2 representative tasks per common app)
 */
export const SMART_TASK_LIBRARY: SmartSuggestion[] = [
  // 1. Google Maps
  {
    id: 'maps_coffee',
    titleKey: 'task.maps_coffee.title',
    descriptionKey: 'task.maps_coffee.description',
    goalKey: 'task.maps_coffee.goal',
    profile: 'flash',
    category: 'flash',
    tagKey: 'task.maps_coffee.tag',
    apps: [{ nameKey: 'app.com.google.android.apps.maps.name', icon: 'explore', pkg: 'com.google.android.apps.maps' }],
    requiredPackages: ['com.google.android.apps.maps'],
    priority: 95
  },
  {
    id: 'pro_commute_share',
    titleKey: 'task.pro_commute_share.title',
    descriptionKey: 'task.pro_commute_share.description',
    goalKey: 'task.pro_commute_share.goal',
    profile: 'pro',
    category: 'cross_app',
    tagKey: 'task.pro_commute_share.tag',
    apps: [
      { nameKey: 'app.com.google.android.apps.maps.name', icon: 'explore', pkg: 'com.google.android.apps.maps' },
      { nameKey: 'app.com.google.android.apps.messaging.name', icon: 'chat', pkg: 'com.google.android.apps.messaging' }
    ],
    requiredPackages: ['com.google.android.apps.maps', 'com.google.android.apps.messaging'],
    matchMode: 'all',
    priority: 92
  },

  // 2. Gmail
  {
    id: 'gmail_receipts',
    titleKey: 'task.gmail_receipts.title',
    descriptionKey: 'task.gmail_receipts.description',
    goalKey: 'task.gmail_receipts.goal',
    profile: 'flash',
    category: 'flash',
    tagKey: 'task.gmail_receipts.tag',
    apps: [{ nameKey: 'app.com.google.android.gm.name', icon: 'mail', pkg: 'com.google.android.gm' }],
    requiredPackages: ['com.google.android.gm'],
    priority: 90
  },
  {
    id: 'pro_email_to_calendar',
    titleKey: 'task.pro_email_to_calendar.title',
    descriptionKey: 'task.pro_email_to_calendar.description',
    goalKey: 'task.pro_email_to_calendar.goal',
    profile: 'pro',
    category: 'cross_app',
    tagKey: 'task.pro_email_to_calendar.tag',
    apps: [
      { nameKey: 'app.com.google.android.gm.name', icon: 'mail', pkg: 'com.google.android.gm' },
      { nameKey: 'app.com.google.android.calendar.name', icon: 'calendar_month', pkg: 'com.google.android.calendar' }
    ],
    requiredPackages: ['com.google.android.gm'],
    priority: 94
  },

  // 3. Chrome
  {
    id: 'chrome_research',
    titleKey: 'task.chrome_research.title',
    descriptionKey: 'task.chrome_research.description',
    goalKey: 'task.chrome_research.goal',
    profile: 'flash',
    category: 'flash',
    tagKey: 'task.chrome_research.tag',
    apps: [{ nameKey: 'app.com.android.chrome.name', icon: 'public', pkg: 'com.android.chrome' }],
    requiredPackages: ['com.android.chrome'],
    priority: 88
  },
  {
    id: 'pro_research_keep',
    titleKey: 'task.pro_research_keep.title',
    descriptionKey: 'task.pro_research_keep.description',
    goalKey: 'task.pro_research_keep.goal',
    profile: 'pro',
    category: 'pro',
    tagKey: 'task.pro_research_keep.tag',
    apps: [
      { nameKey: 'app.com.android.chrome.name', icon: 'public', pkg: 'com.android.chrome' },
      { nameKey: 'app.com.google.android.keep.name', icon: 'note_alt', pkg: 'com.google.android.keep' }
    ],
    requiredPackages: ['com.android.chrome'],
    priority: 91
  },

  // 4. YouTube
  {
    id: 'youtube_lofi',
    titleKey: 'task.youtube_lofi.title',
    descriptionKey: 'task.youtube_lofi.description',
    goalKey: 'task.youtube_lofi.goal',
    profile: 'flash',
    category: 'flash',
    tagKey: 'task.youtube_lofi.tag',
    apps: [{ nameKey: 'app.com.google.android.youtube.name', icon: 'smart_display', pkg: 'com.google.android.youtube' }],
    requiredPackages: ['com.google.android.youtube'],
    priority: 85
  },

  // 5. Settings
  {
    id: 'settings_display_wifi',
    titleKey: 'task.settings_display_wifi.title',
    descriptionKey: 'task.settings_display_wifi.description',
    goalKey: 'task.settings_display_wifi.goal',
    profile: 'flash',
    category: 'flash',
    tagKey: 'task.settings_display_wifi.tag',
    apps: [{ nameKey: 'app.com.android.settings.name', icon: 'settings', pkg: 'com.android.settings' }],
    requiredPackages: ['com.android.settings'],
    priority: 87
  },
  {
    id: 'pro_settings_qa',
    titleKey: 'task.pro_settings_qa.title',
    descriptionKey: 'task.pro_settings_qa.description',
    goalKey: 'task.pro_settings_qa.goal',
    profile: 'pro',
    category: 'monitor',
    tagKey: 'task.pro_settings_qa.tag',
    apps: [{ nameKey: 'app.com.android.settings.name', icon: 'settings', pkg: 'com.android.settings' }],
    requiredPackages: ['com.android.settings'],
    priority: 93
  },

  // 6. Clock
  {
    id: 'clock_timer',
    titleKey: 'task.clock_timer.title',
    descriptionKey: 'task.clock_timer.description',
    goalKey: 'task.clock_timer.goal',
    profile: 'flash',
    category: 'flash',
    tagKey: 'task.clock_timer.tag',
    apps: [{ nameKey: 'app.com.google.android.deskclock.name', icon: 'timer', pkg: 'com.google.android.deskclock' }],
    requiredPackages: ['com.google.android.deskclock', 'com.android.deskclock'],
    priority: 86
  },

  // 7. Calculator
  {
    id: 'calc_gratuity',
    titleKey: 'task.calc_gratuity.title',
    descriptionKey: 'task.calc_gratuity.description',
    goalKey: 'task.calc_gratuity.goal',
    profile: 'flash',
    category: 'flash',
    tagKey: 'task.calc_gratuity.tag',
    apps: [{ nameKey: 'app.com.google.android.calculator.name', icon: 'calculate', pkg: 'com.google.android.calculator' }],
    requiredPackages: ['com.google.android.calculator', 'com.android.calculator2'],
    priority: 84
  },

  // 8. Photos
  {
    id: 'photos_inspect',
    titleKey: 'task.photos_inspect.title',
    descriptionKey: 'task.photos_inspect.description',
    goalKey: 'task.photos_inspect.goal',
    profile: 'flash',
    category: 'flash',
    tagKey: 'task.photos_inspect.tag',
    apps: [{ nameKey: 'app.com.google.android.apps.photos.name', icon: 'photo_library', pkg: 'com.google.android.apps.photos' }],
    requiredPackages: ['com.google.android.apps.photos'],
    priority: 82
  },

  // 9. WeChat
  {
    id: 'wechat_browse',
    titleKey: 'task.wechat_browse.title',
    descriptionKey: 'task.wechat_browse.description',
    goalKey: 'task.wechat_browse.goal',
    profile: 'flash',
    category: 'flash',
    tagKey: 'task.wechat_browse.tag',
    apps: [{ nameKey: 'app.com.tencent.mm.name', icon: 'forum', pkg: 'com.tencent.mm' }],
    requiredPackages: ['com.tencent.mm'],
    priority: 89
  },
  {
    id: 'pro_wechat_to_calendar',
    titleKey: 'task.pro_wechat_to_calendar.title',
    descriptionKey: 'task.pro_wechat_to_calendar.description',
    goalKey: 'task.pro_wechat_to_calendar.goal',
    profile: 'pro',
    category: 'cross_app',
    tagKey: 'task.pro_wechat_to_calendar.tag',
    apps: [
      { nameKey: 'app.com.tencent.mm.name', icon: 'forum', pkg: 'com.tencent.mm' },
      { nameKey: 'app.com.google.android.calendar.name', icon: 'calendar_month', pkg: 'com.google.android.calendar' }
    ],
    requiredPackages: ['com.tencent.mm'],
    priority: 93
  },

  // 10. Xiaohongshu
  {
    id: 'xhs_coffee_guide',
    titleKey: 'task.xhs_coffee_guide.title',
    descriptionKey: 'task.xhs_coffee_guide.description',
    goalKey: 'task.xhs_coffee_guide.goal',
    profile: 'flash',
    category: 'flash',
    tagKey: 'task.xhs_coffee_guide.tag',
    apps: [{ nameKey: 'app.com.xingin.xhs.name', icon: 'auto_stories', pkg: 'com.xingin.xhs' }],
    requiredPackages: ['com.xingin.xhs'],
    priority: 87
  },

  // 11. Meituan / Dianping
  {
    id: 'meituan_ramen_search',
    titleKey: 'task.meituan_ramen_search.title',
    descriptionKey: 'task.meituan_ramen_search.description',
    goalKey: 'task.meituan_ramen_search.goal',
    profile: 'flash',
    category: 'flash',
    tagKey: 'task.meituan_ramen_search.tag',
    apps: [{ nameKey: 'app.com.sankuai.meituan.name', icon: 'restaurant', pkg: 'com.sankuai.meituan' }],
    requiredPackages: ['com.sankuai.meituan', 'com.dianping.v1'],
    priority: 86
  },

  // 12. Bilibili
  {
    id: 'bilibili_stream',
    titleKey: 'task.bilibili_stream.title',
    descriptionKey: 'task.bilibili_stream.description',
    goalKey: 'task.bilibili_stream.goal',
    profile: 'flash',
    category: 'flash',
    tagKey: 'task.bilibili_stream.tag',
    apps: [{ nameKey: 'app.tv.danmaku.bili.name', icon: 'video_library', pkg: 'tv.danmaku.bili' }],
    requiredPackages: ['tv.danmaku.bili'],
    priority: 85
  },

  // 13. Play Store
  {
    id: 'pro_playstore_review',
    titleKey: 'task.pro_playstore_review.title',
    descriptionKey: 'task.pro_playstore_review.description',
    goalKey: 'task.pro_playstore_review.goal',
    profile: 'pro',
    category: 'pro',
    tagKey: 'task.pro_playstore_review.tag',
    apps: [{ nameKey: 'app.com.android.vending.name', icon: 'storefront', pkg: 'com.android.vending' }],
    requiredPackages: ['com.android.vending'],
    priority: 88
  }
];
