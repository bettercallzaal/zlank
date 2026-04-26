import type { SnapDoc, Block } from './blocks';

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
      const props: Record<string, unknown> = { label: block.label };
      if (block.variant) props.variant = block.variant;
      if (block.icon) props.icon = block.icon;
      else props.icon = 'external-link';
      elements[id] = {
        type: 'button',
        props,
        on: { press: { action: 'open_url', params: { target: block.url } } },
      };
      ids.push(id);
      break;
    }
    case 'share': {
      const props: Record<string, unknown> = { label: block.label };
      props.icon = block.icon ?? 'share';
      elements[id] = {
        type: 'button',
        props,
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
        props: {
          label: block.label || 'Listen',
          icon: block.icon ?? 'play',
          variant: 'primary',
        },
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
          name: `vote_${idx}`,
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
    case 'chart': {
      const titleId = `${id}_title`;
      const chartId = `${id}_chart`;
      elements[titleId] = {
        type: 'text',
        props: { content: block.title, size: 'md', weight: 'bold' },
      };
      elements[chartId] = {
        type: 'bar_chart',
        props: {
          bars: block.bars,
        },
      };
      ids.push(titleId, chartId);
      break;
    }
    case 'toggle': {
      elements[id] = {
        type: 'toggle_group',
        props: {
          name: `toggle_${idx}`,
          label: block.label,
          options: block.options,
          orientation: block.orientation ?? 'horizontal',
        },
      };
      ids.push(id);
      break;
    }
    case 'navigate': {
      const props: Record<string, unknown> = { label: block.label };
      if (block.variant) props.variant = block.variant;
      if (block.icon) props.icon = block.icon;
      else props.icon = 'chevron-right';
      elements[id] = {
        type: 'button',
        props,
        on: { press: { action: 'submit', params: { target: `${baseUrl}?page=${encodeURIComponent(block.pageId)}` } } },
      };
      ids.push(id);
      break;
    }
  }

  return { ids, elements };
}

export function docToSnap(doc: SnapDoc, baseUrl: string, pageId?: string) {
  // Default to first page if not specified
  const targetPage = pageId || doc.pages[0]?.id;
  const page = doc.pages.find((p) => p.id === targetPage);

  if (!page) {
    // Fallback: render first page if requested page not found
    return docToSnap(doc, baseUrl, doc.pages[0]?.id);
  }

  const allElements: Record<string, Element> = {};
  const childIds: string[] = [];

  page.blocks.forEach((block, idx) => {
    const { ids, elements } = blockToElements(block, idx, baseUrl);
    Object.assign(allElements, elements);
    childIds.push(...ids);
  });

  allElements['page'] = {
    type: 'stack',
    props: { direction: 'vertical', gap: 'md' },
    children: childIds,
  };

  const out: Record<string, unknown> = {
    version: '1.0',
    theme: { accent: doc.theme },
    ui: {
      root: 'page',
      elements: allElements,
    },
  };

  if (doc.confetti) {
    out.effects = ['confetti'];
  }

  return out;
}
