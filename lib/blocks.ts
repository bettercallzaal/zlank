// Block schema for the Zlank builder.

import type { GateRule } from './gates';

export type BlockType =
  | 'header'
  | 'text'
  | 'link'
  | 'share'
  | 'image'
  | 'divider'
  | 'music'
  | 'artist'
  | 'poll'
  | 'chart'
  | 'toggle'
  | 'navigate'
  | 'progress'
  | 'slider'
  | 'switch'
  | 'feedback'
  | 'chatbot'
  | 'leaderboard';

// Subset of the 34 Snap icons - the most useful for blocks.
export const ICONS = [
  'star', 'heart', 'check', 'x', 'info', 'alert-triangle',
  'arrow-right', 'arrow-left', 'external-link', 'chevron-right', 'refresh-cw',
  'message-circle', 'repeat', 'share', 'user', 'users',
  'trophy', 'zap', 'flame', 'gift',
  'image', 'play', 'pause',
  'wallet', 'coins',
  'plus', 'minus', 'bookmark', 'clock',
  'thumbs-up', 'thumbs-down', 'trending-up', 'trending-down',
] as const;
export type IconName = (typeof ICONS)[number];

export type BadgeColor =
  | 'green' | 'red' | 'amber' | 'gray' | 'purple' | 'blue' | 'pink' | 'teal';

export interface HeaderBlock {
  type: 'header';
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeColor?: BadgeColor;
}

export interface TextBlock {
  type: 'text';
  content: string;
}

export interface LinkBlock {
  type: 'link';
  label: string;
  url: string;
  icon?: IconName;
  variant?: 'primary' | 'secondary';
}

export interface ShareBlock {
  type: 'share';
  label: string;
  text: string;
  icon?: IconName;
  /** Optional Farcaster channel key (without leading /). */
  channelKey?: string;
}

export interface ImageBlock {
  type: 'image';
  url: string;
  alt: string;
  aspect: '1:1' | '16:9' | '4:3' | '9:16';
}

export interface DividerBlock {
  type: 'divider';
}

export interface MusicBlock {
  type: 'music';
  url: string;
  label: string;
  icon?: IconName;
}

export interface ArtistBlock {
  type: 'artist';
  fid: number;
  displayName: string;
  label: string;
}

export interface PollBlock {
  type: 'poll';
  question: string;
  options: string[];
}

export interface ChartBar {
  label: string;
  value: number;
}

export interface ChartBlock {
  type: 'chart';
  title: string;
  bars: ChartBar[];
}

export interface ToggleBlock {
  type: 'toggle';
  label: string;
  options: string[];
  orientation?: 'horizontal' | 'vertical';
}

export interface NavigateBlock {
  type: 'navigate';
  label: string;
  pageId: string;
  icon?: IconName;
  variant?: 'primary' | 'secondary';
}

export interface ProgressBlock {
  type: 'progress';
  label: string;
  value: number;
  max: number;
}

export interface SliderBlock {
  type: 'slider';
  label: string;
  min: number;
  max: number;
  defaultValue: number;
}

export interface SwitchBlock {
  type: 'switch';
  label: string;
  defaultChecked: boolean;
}

// Live tally pulled from a referenced poll block on the same page.
// Renders as bar_chart sorted desc, top N. v1 source = 'votes' (poll).
export interface LeaderboardBlock {
  type: 'leaderboard';
  title: string;
  source: 'votes';
  pollBlockIdx: number;
  topN?: number;
}

// User chats with an LLM inline. Submit logs the message + LLM reply to
// Redis (chatlog:{snapId}) and returns a Snap with the reply + same chatbot
// block to keep the loop going. Stateless per-turn (Snap protocol has no
// per-user state surface yet).
export interface ChatbotBlock {
  type: 'chatbot';
  /** Title shown above the chat input. */
  title: string;
  /** Subtitle / instructions. */
  prompt: string;
  /** System prompt that frames the LLM. */
  systemPrompt: string;
  /** Submit button label. */
  label: string;
  /** Placeholder for the input. */
  placeholder?: string;
}

// User types feedback inline. Submit returns a one-tap "Open composer"
// button that pre-fills the cast: "@{mention} {prefix} {text}".
export interface FeedbackBlock {
  type: 'feedback';
  label: string;
  prompt: string;
  /** FC handle without @, e.g. "zaal". */
  mention: string;
  /** Boilerplate prepended to user text. e.g. "feedback for zlank:". */
  prefix?: string;
  /** Channel key (without /) to optionally route the cast. */
  channelKey?: string;
}

type AnyBlock =
  | HeaderBlock
  | TextBlock
  | LinkBlock
  | ShareBlock
  | ImageBlock
  | DividerBlock
  | MusicBlock
  | ArtistBlock
  | PollBlock
  | ChartBlock
  | ToggleBlock
  | NavigateBlock
  | ProgressBlock
  | SliderBlock
  | SwitchBlock
  | FeedbackBlock
  | ChatbotBlock
  | LeaderboardBlock;

// Optional `gate` lets a block require a token-balance check before render.
// Evaluated server-side on POST; falsy on GET (no FID), so gated blocks
// render as a locked stub until the user taps Unlock.
export type Block = AnyBlock & { gate?: GateRule };

export type ThemeAccent =
  | 'purple' | 'amber' | 'blue' | 'green' | 'red' | 'pink' | 'teal' | 'gray';

export interface SnapPage {
  id: string;
  title?: string;
  blocks: Block[];
}

export interface SnapDoc {
  version: 1;
  title: string;
  theme: ThemeAccent;
  pages: SnapPage[];
  /** Snap-level effects applied on render. Currently spec supports 'confetti'. */
  confetti?: boolean;
}

export const DEFAULT_SNAP: SnapDoc = {
  version: 1,
  title: 'My Snap',
  theme: 'purple',
  pages: [
    {
      id: 'home',
      blocks: [
        { type: 'header', title: 'Hello from Zlank', subtitle: 'A Farcaster Snap built in 30 seconds' },
        { type: 'text', content: 'Edit blocks on the left. Hit Deploy to share to feed.' },
        { type: 'link', label: 'Visit Zlank', url: 'https://zlank.online', icon: 'external-link', variant: 'primary' },
        { type: 'share', label: 'Share', text: 'Just built my first Snap with Zlank', icon: 'share' },
      ],
    },
  ],
};

const TITLE_MAX = 100;
const TEXT_MAX = 320;
const LABEL_MAX = 30;
const SUBTITLE_MAX = 160;
const ALT_MAX = 100;
const SHARE_TEXT_MAX = 1024;
const QUESTION_MAX = 200;
const OPTION_MAX = 60;
const NAME_MAX = 60;
const URL_MAX = 2048;
const CHART_BARS_MAX = 6;
const TOGGLE_OPTIONS_MAX = 6;

function clampUrl(url: string): string {
  return url.slice(0, URL_MAX);
}

function clampOptions(options: string[], minCount = 2, maxCount = 4): string[] {
  const clamped = options.map((o) => o.slice(0, OPTION_MAX));
  while (clamped.length < minCount) clamped.push(`Option ${clamped.length + 1}`);
  return clamped.slice(0, maxCount);
}

function clampIcon(icon: IconName | undefined): IconName | undefined {
  if (!icon) return undefined;
  return ICONS.includes(icon) ? icon : undefined;
}

export function clampBlock(block: Block): Block {
  switch (block.type) {
    case 'header':
      return {
        ...block,
        title: block.title.slice(0, TITLE_MAX),
        subtitle: block.subtitle?.slice(0, SUBTITLE_MAX),
        badgeText: block.badgeText?.slice(0, LABEL_MAX),
        badgeColor: block.badgeColor,
      };
    case 'text':
      return { ...block, content: block.content.slice(0, TEXT_MAX) };
    case 'link':
      return {
        ...block,
        label: block.label.slice(0, LABEL_MAX),
        url: clampUrl(block.url),
        icon: clampIcon(block.icon),
        variant: block.variant === 'primary' ? 'primary' : 'secondary',
      };
    case 'share':
      return {
        ...block,
        label: block.label.slice(0, LABEL_MAX),
        text: block.text.slice(0, SHARE_TEXT_MAX),
        icon: clampIcon(block.icon),
        channelKey: block.channelKey?.replace(/^\//, '').slice(0, NAME_MAX),
      };
    case 'image':
      return {
        ...block,
        alt: block.alt.slice(0, ALT_MAX),
        url: clampUrl(block.url),
      };
    case 'divider':
      return block;
    case 'music':
      return {
        ...block,
        label: block.label.slice(0, LABEL_MAX),
        url: clampUrl(block.url),
        icon: clampIcon(block.icon),
      };
    case 'artist':
      return {
        ...block,
        fid: Math.max(0, Math.floor(Number(block.fid) || 0)),
        displayName: block.displayName.slice(0, NAME_MAX),
        label: block.label.slice(0, LABEL_MAX),
      };
    case 'poll':
      return {
        ...block,
        question: block.question.slice(0, QUESTION_MAX),
        options: clampOptions(block.options, 2, 4),
      };
    case 'chart':
      return {
        ...block,
        title: block.title.slice(0, TITLE_MAX),
        bars: block.bars
          .slice(0, CHART_BARS_MAX)
          .map((b) => ({
            label: String(b.label).slice(0, 40),
            value: Math.max(0, Number(b.value) || 0),
          })),
      };
    case 'toggle':
      return {
        ...block,
        label: block.label.slice(0, LABEL_MAX),
        options: clampOptions(block.options, 2, TOGGLE_OPTIONS_MAX),
        orientation: block.orientation === 'vertical' ? 'vertical' : 'horizontal',
      };
    case 'navigate':
      return {
        ...block,
        label: block.label.slice(0, LABEL_MAX),
        pageId: block.pageId.slice(0, 50),
        icon: clampIcon(block.icon),
        variant: block.variant === 'primary' ? 'primary' : 'secondary',
      };
    case 'progress':
      return {
        ...block,
        label: block.label.slice(0, LABEL_MAX),
        value: Math.max(0, Number(block.value) || 0),
        max: Math.max(1, Number(block.max) || 100),
      };
    case 'slider':
      return {
        ...block,
        label: block.label.slice(0, LABEL_MAX),
        min: Number(block.min) || 0,
        max: Number(block.max) || 100,
        defaultValue: Number(block.defaultValue) || 0,
      };
    case 'switch':
      return {
        ...block,
        label: block.label.slice(0, LABEL_MAX),
        defaultChecked: Boolean(block.defaultChecked),
      };
    case 'feedback':
      return {
        ...block,
        label: block.label.slice(0, LABEL_MAX),
        prompt: block.prompt.slice(0, QUESTION_MAX),
        mention: String(block.mention || 'zaal').replace(/^@/, '').slice(0, NAME_MAX),
        prefix: block.prefix?.slice(0, LABEL_MAX),
        channelKey: block.channelKey?.replace(/^\//, '').slice(0, NAME_MAX),
      };
    case 'chatbot':
      return {
        ...block,
        title: block.title.slice(0, TITLE_MAX),
        prompt: block.prompt.slice(0, QUESTION_MAX),
        systemPrompt: block.systemPrompt.slice(0, 2000),
        label: block.label.slice(0, LABEL_MAX),
        placeholder: block.placeholder?.slice(0, 60),
      };
    case 'leaderboard':
      return {
        ...block,
        title: block.title.slice(0, TITLE_MAX),
        source: 'votes',
        pollBlockIdx: Math.max(0, Math.floor(Number(block.pollBlockIdx) || 0)),
        topN: Math.min(Math.max(Number(block.topN) || 5, 1), 6),
      };
  }
}

export function getPageIds(doc: SnapDoc): string[] {
  return doc.pages.map((p) => p.id);
}
