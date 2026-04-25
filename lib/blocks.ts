// Block schema for the Zlank builder.
// Each block represents one piece of a Snap. Builder UI maps to these,
// renderer (lib/snap-spec.ts) maps these to Snap UI elements.

export type BlockType = 'header' | 'text' | 'link' | 'share' | 'image' | 'divider';

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

export type Block = HeaderBlock | TextBlock | LinkBlock | ShareBlock | ImageBlock | DividerBlock;

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
        url: block.url.slice(0, 2048),
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
      };
    case 'divider':
      return block;
  }
}
