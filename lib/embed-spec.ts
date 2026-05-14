import type { SnapDoc, Block, ThemeAccent } from './blocks';
import { isHttpsUrl } from './blocks';
import { resolveDataSources } from './live-data';
import { applyPlaceholders } from './snap-spec';
import type { ResolvedDataSources } from './live-data';

// Renders a SnapDoc to a self-contained, iframe-safe HTML document for embed
// on any publisher webpage. This is a display + outbound-link surface only:
// Snap-protocol actions (submit, compose_cast, swap_token) require a Farcaster
// client, so interactive blocks degrade to their prompt text plus an
// "Open in Farcaster" affordance.
//
// SECURITY: every interpolated value is user-controlled SnapDoc content that
// renders onto third-party pages. Escape everything. Never emit a raw URL
// without an HTTPS check.

const THEME_ACCENT: Record<ThemeAccent, string> = {
  purple: '#a855f7',
  amber: '#f5a623',
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  pink: '#ec4899',
  teal: '#14b8a6',
  gray: '#9ca3af',
};

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escape a URL for an href: HTTPS only, then HTML-escape. Returns '' if unsafe. */
function safeHref(url: string | undefined): string {
  return isHttpsUrl(url) ? escapeHtml(url as string) : '';
}

function sub(value: string, data: ResolvedDataSources): string {
  return escapeHtml(applyPlaceholders(value, data));
}

function blockToHtml(block: Block, data: ResolvedDataSources): string {
  switch (block.type) {
    case 'header': {
      const badge = block.badgeText
        ? `<span class="badge">${sub(block.badgeText, data)}</span>`
        : '';
      const subtitle = block.subtitle
        ? `<p class="sub">${sub(block.subtitle, data)}</p>`
        : '';
      return `<div class="block hdr"><h2>${sub(block.title, data)}</h2>${subtitle}${badge}</div>`;
    }
    case 'text':
      return `<p class="block txt">${sub(block.content, data)}</p>`;
    case 'link': {
      const href = safeHref(block.url);
      if (!href) return '';
      return `<a class="block btn ${block.variant === 'primary' ? 'primary' : ''}" href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(block.label)}</a>`;
    }
    case 'music': {
      const href = safeHref(block.url);
      if (!href) return '';
      return `<a class="block btn primary" href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(block.label || 'Listen')}</a>`;
    }
    case 'share': {
      const composeText = encodeURIComponent(applyPlaceholders(block.text, data));
      const href = `https://farcaster.xyz/~/compose?text=${composeText}`;
      return `<a class="block btn" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(block.label)}</a>`;
    }
    case 'image': {
      const src = safeHref(block.url);
      if (!src) return '';
      return `<img class="block img" src="${src}" alt="${escapeHtml(block.alt)}" loading="lazy" />`;
    }
    case 'divider':
      return '<hr class="block" />';
    case 'artist': {
      const href = `https://farcaster.xyz/~/profiles/${encodeURIComponent(String(block.fid))}`;
      return `<a class="block btn" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(block.label || block.displayName)}</a>`;
    }
    case 'chart':
    case 'leaderboard': {
      const title = escapeHtml(block.title);
      const bars =
        block.type === 'chart'
          ? block.bars
          : [];
      if (bars.length === 0) {
        return `<div class="block chart"><h3>${title}</h3><p class="sub">No data yet.</p></div>`;
      }
      const max = Math.max(...bars.map((b) => b.value), 1);
      const rows = bars
        .map((b) => {
          const pct = Math.round((b.value / max) * 100);
          return `<div class="bar-row"><span class="bar-label">${escapeHtml(String(b.label))}</span><span class="bar-track"><span class="bar-fill" style="width:${pct}%"></span></span></div>`;
        })
        .join('');
      return `<div class="block chart"><h3>${title}</h3>${rows}</div>`;
    }
    case 'progress': {
      const pct = Math.round((Math.min(block.value, block.max) / Math.max(block.max, 1)) * 100);
      return `<div class="block progress"><span class="bar-label">${escapeHtml(block.label)}</span><span class="bar-track"><span class="bar-fill" style="width:${pct}%"></span></span></div>`;
    }
    case 'liveScore': {
      const feed = (data[block.dataSourceId] ?? null) as
        | { home?: number | string; away?: number | string; minute?: number | string; status?: string }
        | null;
      const hasScore = feed !== null && (feed.home !== undefined || feed.away !== undefined);
      const line = hasScore
        ? `${escapeHtml(block.home)} ${escapeHtml(String(feed?.home ?? 0))} - ${escapeHtml(String(feed?.away ?? 0))} ${escapeHtml(block.away)}`
        : `${escapeHtml(block.home)} vs ${escapeHtml(block.away)}`;
      const meta: string[] = [];
      if (feed?.status) meta.push(escapeHtml(String(feed.status)));
      if (block.showMinute && feed?.minute !== undefined && feed.minute !== '') {
        meta.push(`${escapeHtml(String(feed.minute))}'`);
      }
      const metaHtml = meta.length ? `<p class="sub">${meta.join(' - ')}</p>` : '';
      return `<div class="block hdr"><h2>${line}</h2>${metaHtml}</div>`;
    }
    case 'poll':
    case 'toggle':
    case 'slider':
    case 'switch':
    case 'feedback':
    case 'chatbot':
    case 'navigate': {
      // Interactive blocks need a Farcaster client. Show the prompt text and
      // an open affordance rather than a dead control.
      const promptText =
        block.type === 'poll'
          ? block.question
          : block.type === 'chatbot'
            ? block.title
            : block.type === 'feedback'
              ? block.prompt
              : block.label;
      return `<div class="block interactive"><p>${sub(promptText, data)}</p><span class="hint">Open in Farcaster to interact</span></div>`;
    }
    default:
      return '';
  }
}

export interface DocToEmbedHtmlOpts {
  /** Page to render. Defaults to the first page. */
  pageId?: string;
}

/**
 * Render a SnapDoc to a complete, iframe-safe HTML document. Resolves the
 * doc's live data sources and substitutes ${data.X} placeholders.
 */
export async function docToEmbedHtml(
  doc: SnapDoc,
  opts: DocToEmbedHtmlOpts = {},
): Promise<string> {
  const data = doc.dataSource ? await resolveDataSources(doc.dataSource) : {};
  const page = doc.pages.find((p) => p.id === opts.pageId) ?? doc.pages[0];
  const blocksHtml = page ? page.blocks.map((b) => blockToHtml(b, data)).join('\n') : '';
  const accent = THEME_ACCENT[doc.theme] ?? THEME_ACCENT.purple;
  const partnerBadge = doc.partner?.attribution
    ? `<div class="partner">Powered by ${escapeHtml(doc.partner.name)}</div>`
    : '';
  const title = escapeHtml(applyPlaceholders(doc.title, data));

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
:root { --accent: ${accent}; }
* { box-sizing: border-box; }
body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 16px; background: #0f1623; color: #e8eef7; }
.snap { max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
.block { margin: 0; }
.hdr h2 { margin: 0 0 4px; font-size: 1.25rem; }
.sub { margin: 0; color: #b8c4d4; font-size: 0.9rem; }
.txt { color: #d4dce8; line-height: 1.5; }
.badge { display: inline-block; margin-top: 6px; padding: 2px 8px; border-radius: 999px; background: var(--accent); color: #0f1623; font-size: 0.75rem; font-weight: 700; }
.btn { display: block; padding: 10px 14px; border-radius: 10px; background: #1c2740; color: #e8eef7; text-decoration: none; text-align: center; font-weight: 600; }
.btn.primary { background: var(--accent); color: #0f1623; }
.img { width: 100%; border-radius: 10px; display: block; }
hr { border: none; border-top: 1px solid #2a3754; }
.chart h3, .progress .bar-label { font-size: 0.95rem; margin: 0 0 6px; }
.bar-row { display: flex; align-items: center; gap: 8px; margin: 4px 0; }
.bar-label { font-size: 0.8rem; color: #b8c4d4; min-width: 64px; }
.bar-track { flex: 1; height: 10px; background: #1c2740; border-radius: 999px; overflow: hidden; }
.bar-fill { display: block; height: 100%; background: var(--accent); }
.interactive { padding: 12px; border: 1px dashed #2a3754; border-radius: 10px; }
.interactive p { margin: 0 0 4px; }
.hint { font-size: 0.75rem; color: #8b97a8; }
.partner { margin-top: 8px; text-align: center; font-size: 0.75rem; color: #8b97a8; }
</style>
</head>
<body>
<div class="snap">
${blocksHtml}
${partnerBadge}
</div>
</body>
</html>`;
}
