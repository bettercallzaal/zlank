import type { SnapDoc, Block } from './blocks.js';

// Convert Zlank block list into Farcaster Snap UI JSON.
// Each block becomes 1-3 elements in the ui.elements tree.

interface Element {
  type: string;
  props?: Record<string, unknown>;
  children?: string[];
  on?: Record<string, unknown>;
}

function blockToElements(
  block: Block,
  idx: number,
  baseUrl: string,
): { ids: string[]; elements: Record<string, Element> } {
  const id = `b${idx}`;
  const elements: Record<string, Element> = {};
  const ids: string[] = [];

  switch (block.type) {
    case 'header': {
      elements[id] = {
        type: 'item',
        props: { title: block.title, description: block.subtitle ?? '' },
      };
      ids.push(id);
      break;
    }
    case 'text': {
      elements[id] = {
        type: 'text',
        props: { content: block.content, size: 'md' },
      };
      ids.push(id);
      break;
    }
    case 'link': {
      elements[id] = {
        type: 'button',
        props: { label: block.label, variant: 'primary', icon: 'external-link' },
        on: { press: { action: 'open_url', params: { target: block.url } } },
      };
      ids.push(id);
      break;
    }
    case 'share': {
      elements[id] = {
        type: 'button',
        props: { label: block.label, icon: 'share' },
        on: {
          press: {
            action: 'compose_cast',
            params: { text: block.text, embeds: [baseUrl] },
          },
        },
      };
      ids.push(id);
      break;
    }
    case 'image': {
      elements[id] = {
        type: 'image',
        props: { url: block.url, alt: block.alt, aspect: block.aspect },
      };
      ids.push(id);
      break;
    }
    case 'divider': {
      elements[id] = { type: 'separator', props: {} };
      ids.push(id);
      break;
    }
    case 'music': {
      elements[id] = {
        type: 'button',
        props: { label: block.label || 'Listen', icon: 'play', variant: 'primary' },
        on: { press: { action: 'open_url', params: { target: block.url } } },
      };
      ids.push(id);
      break;
    }
    case 'artist': {
      const itemId = `${id}_item`;
      const btnId = `${id}_btn`;
      elements[itemId] = {
        type: 'item',
        props: { title: block.displayName, description: 'Farcaster artist' },
      };
      elements[btnId] = {
        type: 'button',
        props: { label: block.label || 'View profile', icon: 'user', variant: 'primary' },
        on: { press: { action: 'view_profile', params: { fid: block.fid } } },
      };
      ids.push(itemId, btnId);
      break;
    }
    case 'poll': {
      const qId = `${id}_q`;
      const inputId = `${id}_input`;
      const btnId = `${id}_btn`;
      elements[qId] = {
        type: 'text',
        props: { content: block.question, size: 'md', weight: 'bold' },
      };
      elements[inputId] = {
        type: 'input',
        props: {
          name: 'vote',
          type: 'text',
          label: 'Your vote',
          placeholder: block.options.join(' / '),
        },
      };
      elements[btnId] = {
        type: 'button',
        props: { label: 'Submit vote', variant: 'primary', icon: 'check' },
        on: {
          press: {
            action: 'submit',
            params: { target: baseUrl },
          },
        },
      };
      ids.push(qId, inputId, btnId);
      break;
    }
  }

  return { ids, elements };
}

export function docToSnap(doc: SnapDoc, baseUrl: string) {
  const allElements: Record<string, Element> = {};
  const childIds: string[] = [];

  doc.blocks.forEach((block, idx) => {
    const { ids, elements } = blockToElements(block, idx, baseUrl);
    Object.assign(allElements, elements);
    childIds.push(...ids);
  });

  // Wrap blocks in a vertical stack root.
  allElements['page'] = {
    type: 'stack',
    props: { direction: 'vertical', gap: 'md' },
    children: childIds,
  };

  return {
    version: '1.0' as const,
    theme: { accent: doc.theme },
    ui: {
      root: 'page',
      elements: allElements,
    },
  };
}
