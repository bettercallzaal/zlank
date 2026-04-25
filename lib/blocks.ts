// Block schema for the Zlank builder.
// Each block represents one piece of a Snap. Builder UI maps to these,
// renderer (lib/snap-spec.ts) maps these to Snap UI elements.

export type BlockType =
  | 'header'
  | 'text'
  | 'link'
  | 'share'
  | 'image'
  | 'divider'
  | 'music'
  | 'artist'
  | 'poll';

export interface HeaderBlock {
  type: 'header';
  title: string;
  subtitle?: string;
}

export interface TextBlock {
  type: 'text';
  content: string;
}

export interface LinkBlock {
  type: 'link';
  label: string;
  url: string;
}

export interface ShareBlock {
  type: 'share';
  label: string;
  text: string;
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

export type Block =
  | HeaderBlock
  | TextBlock
  | LinkBlock
  | ShareBlock
  | ImageBlock
  | DividerBlock
  | MusicBlock
  | ArtistBlock
  | PollBlock;

export interface SnapDoc {
  version: 1;
  title: string;
  theme: 'purple' | 'amber' | 'blue' | 'green' | 'red' | 'pink' | 'teal' | 'gray';
  blocks: Block[];
}

export const DEFAULT_SNAP: SnapDoc = {
  version: 1,
  title: 'My Snap',
  theme: 'purple',
  blocks: [
    { type: 'header', title: 'Hello from Zlank', subtitle: 'A Farcaster Snap built in 30 seconds' },
    { type: 'text', content: 'Edit blocks on the left. Hit Deploy to share to feed.' },
    { type: 'link', label: 'Visit Zlank', url: 'https://zlank.online' },
    { type: 'share', label: 'Share', text: 'Just built my first Snap with Zlank' },
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

function clampUrl(url: string): string {
  return url.slice(0, URL_MAX);
}

function clampOptions(options: string[]): string[] {
  const clamped = options.map((o) => o.slice(0, OPTION_MAX));
  if (clamped.length < 2) {
    while (clamped.length < 2) clamped.push(`Option ${clamped.length + 1}`);
  }
  return clamped.slice(0, 4);
}

export function clampBlock(block: Block): Block {
  switch (block.type) {
    case 'header':
      return {
        ...block,
        title: block.title.slice(0, TITLE_MAX),
        subtitle: block.subtitle?.slice(0, SUBTITLE_MAX),
      };
    case 'text':
      return { ...block, content: block.content.slice(0, TEXT_MAX) };
    case 'link':
      return {
        ...block,
        label: block.label.slice(0, LABEL_MAX),
        url: clampUrl(block.url),
      };
    case 'share':
      return {
        ...block,
        label: block.label.slice(0, LABEL_MAX),
        text: block.text.slice(0, SHARE_TEXT_MAX),
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
        options: clampOptions(block.options),
      };
  }
}
