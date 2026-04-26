import type { SnapDoc, Block } from './blocks';
import type { GateResult } from './gates';

interface Element {
  type: string;
  props?: Record<string, unknown>;
  children?: string[];
  on?: Record<string, unknown>;
}

/**
 * Replace a gated block with a stub when the viewer fails the gate.
 * - no_fid (GET / unauth POST): "Unlock" submit button (server re-evaluates on POST)
 * - below_threshold / no_address: upsell button (open_url to swap, or generic message)
 */
function gateStubElements(
  block: Block,
  idx: number,
  baseUrl: string,
  gate: GateResult,
): { ids: string[]; elements: Record<string, Element> } {
  const id = `b${idx}`;
  const elements: Record<string, Element> = {};
  const rule = block.gate;

  if (gate.reason === 'no_fid') {
    elements[id] = {
      type: 'button',
      props: {
        label: rule?.symbol ? `Unlock for ${rule.symbol} holders` : 'Unlock',
        variant: 'secondary',
        icon: 'check',
      },
      on: { press: { action: 'submit', params: { target: baseUrl } } },
    };
    return { ids: [id], elements };
  }

  // Failed (no address, below threshold, RPC error): show upsell.
  const label = rule?.symbol
    ? `Holders only - get ${rule.symbol}`
    : 'Holders only';
  if (rule?.upsellUrl) {
    elements[id] = {
      type: 'button',
      props: { label, variant: 'secondary', icon: 'external-link' },
      on: { press: { action: 'open_url', params: { target: rule.upsellUrl } } },
    };
  } else {
    elements[id] = {
      type: 'text',
      props: { content: label, size: 'sm' },
    };
  }
  return { ids: [id], elements };
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
      const itemId = id;
      const childIds: string[] = [];
      if (block.badgeText) {
        const badgeId = `${id}_badge`;
        elements[badgeId] = {
          type: 'badge',
          props: { label: block.badgeText, color: block.badgeColor ?? 'gray' },
        };
        childIds.push(badgeId);
      }
      const itemProps: Record<string, unknown> = { title: block.title };
      if (block.subtitle) itemProps.description = block.subtitle;
      elements[itemId] = {
        type: 'item',
        props: itemProps,
        ...(childIds.length ? { children: childIds } : {}),
      };
      ids.push(itemId);
      break;
    }
    case 'text': {
      const content = block.content?.trim() || ' ';
      elements[id] = {
        type: 'text',
        props: { content, size: 'md' },
      };
      ids.push(id);
      break;
    }
    case 'link': {
      const props: Record<string, unknown> = { label: block.label };
      if (block.variant) props.variant = block.variant;
      props.icon = block.icon ?? 'external-link';
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
      // Single-select toggle_group — user taps one option, then Submit fires the vote.
      // POST handler reads inputs[`vote_${idx}`] = chosen option label.
      const qId = `${id}_q`;
      const groupId = `${id}_group`;
      const btnId = `${id}_btn`;
      elements[qId] = {
        type: 'text',
        props: { content: block.question, size: 'md', weight: 'bold' },
      };
      elements[groupId] = {
        type: 'toggle_group',
        props: {
          name: `vote_${idx}`,
          options: block.options,
          orientation: block.options.length > 3 ? 'vertical' : 'horizontal',
        },
      };
      elements[btnId] = {
        type: 'button',
        props: { label: 'Submit vote', variant: 'primary', icon: 'check' },
        on: {
          press: { action: 'submit', params: { target: baseUrl } },
        },
      };
      ids.push(qId, groupId, btnId);
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
        props: { bars: block.bars },
      };
      ids.push(titleId, chartId);
      break;
    }
    case 'toggle': {
      // Multi-select toggle_group + Submit. POST reads inputs[`toggle_${idx}`] = selected[].
      const groupId = `${id}_group`;
      const btnId = `${id}_btn`;
      elements[groupId] = {
        type: 'toggle_group',
        props: {
          name: `toggle_${idx}`,
          label: block.label,
          options: block.options,
          orientation: block.orientation ?? 'horizontal',
          multiple: true,
        },
      };
      elements[btnId] = {
        type: 'button',
        props: { label: 'Save selection', variant: 'primary', icon: 'check' },
        on: {
          press: { action: 'submit', params: { target: baseUrl } },
        },
      };
      ids.push(groupId, btnId);
      break;
    }
    case 'navigate': {
      const props: Record<string, unknown> = { label: block.label };
      if (block.variant) props.variant = block.variant;
      props.icon = block.icon ?? 'chevron-right';
      elements[id] = {
        type: 'button',
        props,
        on: {
          press: {
            action: 'submit',
            params: { target: `${baseUrl}?page=${encodeURIComponent(block.pageId)}` },
          },
        },
      };
      ids.push(id);
      break;
    }
    case 'progress': {
      const propsObj: Record<string, unknown> = {
        value: block.value,
        max: block.max,
      };
      if (block.label) propsObj.label = block.label;
      elements[id] = { type: 'progress', props: propsObj };
      ids.push(id);
      break;
    }
    case 'slider': {
      const sliderId = `${id}_slider`;
      const btnId = `${id}_btn`;
      elements[sliderId] = {
        type: 'slider',
        props: {
          name: `slider_${idx}`,
          label: block.label,
          min: block.min,
          max: block.max,
          defaultValue: block.defaultValue,
          showValue: true,
        },
      };
      elements[btnId] = {
        type: 'button',
        props: { label: 'Save', variant: 'primary', icon: 'check' },
        on: {
          press: { action: 'submit', params: { target: baseUrl } },
        },
      };
      ids.push(sliderId, btnId);
      break;
    }
    case 'switch': {
      const switchId = `${id}_switch`;
      const btnId = `${id}_btn`;
      elements[switchId] = {
        type: 'switch',
        props: {
          name: `switch_${idx}`,
          label: block.label,
          defaultChecked: block.defaultChecked,
        },
      };
      elements[btnId] = {
        type: 'button',
        props: { label: 'Save', variant: 'primary', icon: 'check' },
        on: {
          press: { action: 'submit', params: { target: baseUrl } },
        },
      };
      ids.push(switchId, btnId);
      break;
    }
  }

  return { ids, elements };
}

export interface DocToSnapOpts {
  pageId?: string;
  /** Per-block-index gate results from POST handler. */
  gateResults?: Map<number, GateResult>;
}

export function docToSnap(
  doc: SnapDoc,
  baseUrl: string,
  pageIdOrOpts?: string | DocToSnapOpts,
) {
  const opts: DocToSnapOpts =
    typeof pageIdOrOpts === 'string'
      ? { pageId: pageIdOrOpts }
      : (pageIdOrOpts ?? {});
  const targetPage = opts.pageId || doc.pages[0]?.id;
  const page = doc.pages.find((p) => p.id === targetPage);

  if (!page) {
    return docToSnap(doc, baseUrl, { ...opts, pageId: doc.pages[0]?.id });
  }

  const allElements: Record<string, Element> = {};
  const childIds: string[] = [];

  page.blocks.forEach((block, idx) => {
    if (block.gate) {
      const result = opts.gateResults?.get(idx);
      const passed = result?.passed === true;
      if (!passed) {
        const stub = gateStubElements(
          block,
          idx,
          baseUrl,
          result ?? { passed: false, reason: 'no_fid' },
        );
        Object.assign(allElements, stub.elements);
        childIds.push(...stub.ids);
        return;
      }
    }
    const { ids, elements } = blockToElements(block, idx, baseUrl);
    Object.assign(allElements, elements);
    childIds.push(...ids);
  });

  // Auto-append "zlank.online" footer to every Snap (viral attribution).
  const homepageOrigin = (() => {
    try {
      return new URL(baseUrl).origin;
    } catch {
      return 'https://zlank.online';
    }
  })();
  allElements['_zlank_sep'] = { type: 'separator', props: {} };
  allElements['_zlank_footer'] = {
    type: 'button',
    props: { label: 'zlank.online', icon: 'star' },
    on: {
      press: { action: 'open_url', params: { target: homepageOrigin } },
    },
  };
  childIds.push('_zlank_sep', '_zlank_footer');

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
