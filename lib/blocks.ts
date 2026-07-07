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
  | 'leaderboard'
  | 'liveScore'
  | 'oddsTicker'
  | 'parlayBuilder'
  | 'agentChat'
  | 'mintButton'
  | 'subscribeButton'
  | 'bountyEscrow'
  | 'marketEmbed'
  | 'tokenDeploy'
  | 'coinPost';

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

// Live sports scoreboard. home/away are static labels; the score, minute, and
// status come from a DataSource resolved at render time and looked up by
// dataSourceId. The resolved value shape is { home, away, minute?, status? }.
export interface LiveScoreBlock {
  type: 'liveScore';
  home: string;
  away: string;
  /** HTTPS only. */
  homeLogoUrl?: string;
  /** HTTPS only. */
  awayLogoUrl?: string;
  /** ID of the DataSource carrying { home, away, minute?, status? }. */
  dataSourceId: string;
  showMinute?: boolean;
}

// Sportsbook odds ticker. Each leg is a labeled price; if bookmakerUrl is set
// the legs deep-link to the book's bet slip. dataSourceId can carry live odds.
export interface OddsLeg {
  label: string;
  odds: string;
}

export interface OddsTickerBlock {
  type: 'oddsTicker';
  market: string;
  legs: OddsLeg[];
  /** Optional DataSource id for live odds. */
  dataSourceId?: string;
  bookmaker?: string;
  /** HTTPS only. Legs deep-link here when set. */
  bookmakerUrl?: string;
}

// Multi-leg parlay selector. Each candidate is a priced market the user can
// toggle; selections submit to a bookmaker bet slip.
export interface ParlayCandidate {
  id: string;
  label: string;
  odds: string;
  selected?: boolean;
}

export interface ParlayBuilderBlock {
  type: 'parlayBuilder';
  title: string;
  candidates: ParlayCandidate[];
  /** Max legs a user can combine. Clamped 1..8, default 4. */
  maxLegs?: number;
  /** HTTPS only. Selected legs submit here. */
  bookmakerUrl?: string;
}

// Agentic chat block. Like chatbot but with a persona preset, a tool-use
// whitelist, and partner-attributed billing. Tool dispatch + LLM wiring land
// with the agent runtime; v1 carries the schema and renders the chat surface.
export type AgentPersona = 'coach' | 'announcer' | 'analyst' | 'concierge';
export type AgentTool = 'fetch-cast' | 'fetch-score' | 'open-market' | 'compose-cast';

export interface AgentChatBlock {
  type: 'agentChat';
  title: string;
  /** Frames the agent. Clamped to 1024 chars. */
  systemPrompt: string;
  persona?: AgentPersona;
  tools?: AgentTool[];
  /** Partner the agent's usage bills to. */
  partnerId?: string;
  placeholder?: string;
  label?: string;
}

// One-tap NFT mint trigger. chainId selects the network; the click opens a
// transaction in a Farcaster client.
export interface MintButtonBlock {
  type: 'mintButton';
  label: string;
  /** 0x-prefixed contract address. */
  contractAddress: string;
  chainId: number;
  /** For ERC-1155 collections. */
  tokenId?: string;
  priceWei?: string;
  partnerId?: 'highlight' | 'manifold' | 'sound' | 'zora';
}

// Onchain subscription trigger (Hypersub / Fabric STP).
export interface SubscribeButtonBlock {
  type: 'subscribeButton';
  label: string;
  /** 0x-prefixed STP contract address. */
  subContractAddress: string;
  chainId: number;
  /** Subscription length. Clamped 1..3650. */
  durationDays: number;
  priceCurrency: 'USDC' | 'ETH';
}

// Bounty post with escrow (Bountycaster integration).
export interface BountyEscrowBlock {
  type: 'bountyEscrow';
  title: string;
  description: string;
  /** USD amount. Clamped 0..100000. */
  amountUsd: number;
  /** Optional pre-assigned hunter FID. */
  hunterFid?: number;
  /** HTTPS only. */
  bountycasterUrl?: string;
}

// Prediction-market embed (Polymarket / Kalshi / Manifold).
export interface MarketEmbedBlock {
  type: 'marketEmbed';
  marketSlug: string;
  source: 'polymarket' | 'kalshi' | 'manifold';
  showOdds?: boolean;
  showVolume?: boolean;
  betButton?: boolean;
}

// One-click token deploy (Clanker).
export interface TokenDeployBlock {
  type: 'tokenDeploy';
  name: string;
  /** Uppercased, clamped to 8 chars. */
  symbol: string;
  description?: string;
  /** HTTPS only. */
  imageUrl?: string;
  clankerVersion?: 'v3' | 'v4';
}

// Zora coin-a-post embed.
export interface CoinPostBlock {
  type: 'coinPost';
  /** Zora coin id or cast hash. */
  postId: string;
  showHolders?: boolean;
  showPrice?: boolean;
  buyButton?: boolean;
  /** HTTPS only. */
  zoraUrl?: string;
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
  | LeaderboardBlock
  | LiveScoreBlock
  | OddsTickerBlock
  | ParlayBuilderBlock
  | AgentChatBlock
  | MintButtonBlock
  | SubscribeButtonBlock
  | BountyEscrowBlock
  | MarketEmbedBlock
  | TokenDeployBlock
  | CoinPostBlock;

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

/**
 * Optional creator-coin association. When set, every page auto-prepends a
 * swap_token button at the top so the snap doubles as a coin-buy surface.
 */
export interface SnapCoin {
  /** CAIP-19 token identifier, e.g. eip155:8453/erc20:0x... */
  caip19: string;
  /** Display symbol, used for the button label. */
  symbol?: string;
}

/**
 * Partner metadata for co-branded snaps. Includes attribution, logo, and landing page.
 */
export interface PartnerMeta {
  /** Slug identifier, e.g. 'footy', 'clanker', 'polymarket'. */
  id: string;
  /** Display name, e.g. 'Footy App'. */
  name: string;
  /** Whether to show a "Powered by" badge in the snap render. */
  attribution: boolean;
  /** Partner landing page (HTTPS only). */
  url?: string;
  /** Partner logo URL (HTTPS only). */
  logoUrl?: string;
}

/** Kind of data source for live bindings. */
export type DataSourceKind = 'rest' | 'webhook' | 'snap' | 'static';

/**
 * Live data source binding referenced by blocks via dataSourceId.
 * Used to hydrate dynamic block content (e.g., leaderboard scores, poll aggregates).
 */
export interface DataSource {
  /** ID used by blocks to reference this source. */
  id: string;
  /** Kind of source (REST API, webhook, another snap, or static value). */
  kind: DataSourceKind;
  /** URL endpoint for rest/webhook (HTTPS only). */
  url?: string;
  /** Poll interval in seconds; later tasks will clamp to 10..3600. */
  refreshSec?: number;
  /** Snap ID to aggregate from (for kind=snap). */
  snapId?: string;
  /** Static value for kind=static (use unknown, not any). */
  staticValue?: unknown;
}

/** Mode in which the snap is embedded or accessed. */
export type EmbedMode = 'iframe' | 'mini-app' | 'snap-native';

export interface SnapDoc {
  version: 1 | 2;
  title: string;
  theme: ThemeAccent;
  pages: SnapPage[];
  /** Snap-level effects applied on render. Currently spec supports 'confetti'. */
  confetti?: boolean;
  /** Optional coin auto-injects a swap_token button on every page. */
  coin?: SnapCoin;
  /** Parent snap ID for fork lineage tracking. */
  parentId?: string;
  /** Partner co-branding metadata. */
  partner?: PartnerMeta;
  /** Whether this snap is forkable by other users. */
  forkable?: boolean;
  /** Mode in which the snap is embedded (iframe, mini-app, or snap-native). */
  embedMode?: EmbedMode;
  /** Live data sources that blocks can reference. */
  dataSource?: DataSource[];
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

/** True only for a non-empty string that starts with https://. */
export function isHttpsUrl(url: string | undefined): boolean {
  return typeof url === 'string' && url.startsWith('https://');
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
    case 'liveScore':
      return {
        ...block,
        home: block.home.slice(0, LABEL_MAX),
        away: block.away.slice(0, LABEL_MAX),
        homeLogoUrl: isHttpsUrl(block.homeLogoUrl) ? block.homeLogoUrl : undefined,
        awayLogoUrl: isHttpsUrl(block.awayLogoUrl) ? block.awayLogoUrl : undefined,
        dataSourceId: String(block.dataSourceId).slice(0, 64),
        showMinute: block.showMinute === undefined ? undefined : Boolean(block.showMinute),
      };
    case 'oddsTicker':
      return {
        ...block,
        market: block.market.slice(0, QUESTION_MAX),
        legs: block.legs.slice(0, 6).map((leg) => ({
          label: String(leg.label).slice(0, OPTION_MAX),
          odds: String(leg.odds).slice(0, 20),
        })),
        dataSourceId: block.dataSourceId ? String(block.dataSourceId).slice(0, 64) : undefined,
        bookmaker: block.bookmaker?.slice(0, NAME_MAX),
        bookmakerUrl: isHttpsUrl(block.bookmakerUrl) ? block.bookmakerUrl : undefined,
      };
    case 'parlayBuilder':
      return {
        ...block,
        title: block.title.slice(0, QUESTION_MAX),
        candidates: block.candidates.slice(0, 8).map((c) => ({
          id: String(c.id).slice(0, 64),
          label: String(c.label).slice(0, OPTION_MAX),
          odds: String(c.odds).slice(0, 20),
          selected: c.selected === undefined ? undefined : Boolean(c.selected),
        })),
        maxLegs:
          block.maxLegs === undefined
            ? undefined
            : Math.min(8, Math.max(1, Math.floor(Number(block.maxLegs) || 4))),
        bookmakerUrl: isHttpsUrl(block.bookmakerUrl) ? block.bookmakerUrl : undefined,
      };
    case 'agentChat': {
      const personas: AgentPersona[] = ['coach', 'announcer', 'analyst', 'concierge'];
      const validTools: AgentTool[] = ['fetch-cast', 'fetch-score', 'open-market', 'compose-cast'];
      return {
        ...block,
        title: block.title.slice(0, TITLE_MAX),
        systemPrompt: block.systemPrompt.slice(0, 1024),
        persona: block.persona && personas.includes(block.persona) ? block.persona : undefined,
        tools: block.tools?.filter((t) => validTools.includes(t)),
        partnerId: block.partnerId ? String(block.partnerId).slice(0, 32) : undefined,
        placeholder: block.placeholder?.slice(0, 60),
        label: block.label?.slice(0, LABEL_MAX),
      };
    }
    case 'mintButton': {
      const partners = ['highlight', 'manifold', 'sound', 'zora'] as const;
      return {
        ...block,
        label: block.label.slice(0, LABEL_MAX),
        contractAddress: String(block.contractAddress).slice(0, 64),
        chainId: Math.max(0, Math.floor(Number(block.chainId) || 0)),
        tokenId: block.tokenId ? String(block.tokenId).slice(0, 80) : undefined,
        priceWei: block.priceWei ? String(block.priceWei).slice(0, 40) : undefined,
        partnerId:
          block.partnerId && partners.includes(block.partnerId) ? block.partnerId : undefined,
      };
    }
    case 'subscribeButton':
      return {
        ...block,
        label: block.label.slice(0, LABEL_MAX),
        subContractAddress: String(block.subContractAddress).slice(0, 64),
        chainId: Math.max(0, Math.floor(Number(block.chainId) || 0)),
        durationDays: Math.min(3650, Math.max(1, Math.floor(Number(block.durationDays) || 30))),
        priceCurrency: block.priceCurrency === 'ETH' ? 'ETH' : 'USDC',
      };
    case 'bountyEscrow':
      return {
        ...block,
        title: block.title.slice(0, TITLE_MAX),
        description: block.description.slice(0, TEXT_MAX),
        amountUsd: Math.min(100000, Math.max(0, Number(block.amountUsd) || 0)),
        hunterFid:
          block.hunterFid === undefined
            ? undefined
            : Math.max(0, Math.floor(Number(block.hunterFid) || 0)),
        bountycasterUrl: isHttpsUrl(block.bountycasterUrl) ? block.bountycasterUrl : undefined,
      };
    case 'marketEmbed': {
      const sources = ['polymarket', 'kalshi', 'manifold'] as const;
      return {
        ...block,
        marketSlug: String(block.marketSlug).slice(0, 120),
        source: sources.includes(block.source) ? block.source : 'polymarket',
        showOdds: block.showOdds === undefined ? undefined : Boolean(block.showOdds),
        showVolume: block.showVolume === undefined ? undefined : Boolean(block.showVolume),
        betButton: block.betButton === undefined ? undefined : Boolean(block.betButton),
      };
    }
    case 'tokenDeploy':
      return {
        ...block,
        name: block.name.slice(0, 32),
        symbol: String(block.symbol).toUpperCase().slice(0, 8),
        description: block.description?.slice(0, 160),
        imageUrl: isHttpsUrl(block.imageUrl) ? block.imageUrl : undefined,
        clankerVersion: block.clankerVersion === 'v3' ? 'v3' : block.clankerVersion === 'v4' ? 'v4' : undefined,
      };
    case 'coinPost':
      return {
        ...block,
        postId: String(block.postId).slice(0, 80),
        showHolders: block.showHolders === undefined ? undefined : Boolean(block.showHolders),
        showPrice: block.showPrice === undefined ? undefined : Boolean(block.showPrice),
        buyButton: block.buyButton === undefined ? undefined : Boolean(block.buyButton),
        zoraUrl: isHttpsUrl(block.zoraUrl) ? block.zoraUrl : undefined,
      };
  }
}

const PARTNER_ID_MAX = 32;
const PARTNER_NAME_MAX = 40;
const PARENT_ID_MAX = 64;
const DATA_SOURCE_ID_MAX = 64;
const REFRESH_SEC_MIN = 10;
const REFRESH_SEC_MAX = 3600;
const DATA_SOURCE_KINDS: readonly DataSourceKind[] = ['rest', 'webhook', 'snap', 'static'];
const EMBED_MODES: readonly EmbedMode[] = ['iframe', 'mini-app', 'snap-native'];

function clampPartner(partner: PartnerMeta): PartnerMeta {
  return {
    id: String(partner.id).slice(0, PARTNER_ID_MAX),
    name: String(partner.name).slice(0, PARTNER_NAME_MAX),
    attribution: Boolean(partner.attribution),
    url: isHttpsUrl(partner.url) ? partner.url : undefined,
    logoUrl: isHttpsUrl(partner.logoUrl) ? partner.logoUrl : undefined,
  };
}

function clampDataSource(ds: DataSource): DataSource {
  return {
    id: String(ds.id).slice(0, DATA_SOURCE_ID_MAX),
    kind: DATA_SOURCE_KINDS.includes(ds.kind) ? ds.kind : 'static',
    url: isHttpsUrl(ds.url) ? ds.url : undefined,
    refreshSec:
      ds.refreshSec === undefined
        ? undefined
        : Math.min(REFRESH_SEC_MAX, Math.max(REFRESH_SEC_MIN, ds.refreshSec)),
    snapId: ds.snapId ? String(ds.snapId).slice(0, DATA_SOURCE_ID_MAX) : undefined,
    staticValue: ds.staticValue,
  };
}

/**
 * Doc-level clamp. Runs every block through clampBlock and bounds the v2
 * fields (partner, dataSource, parentId, forkable, embedMode). Preserves
 * version, title, theme, confetti, and coin unchanged.
 */
export function clampSnap(doc: SnapDoc): SnapDoc {
  return {
    version: doc.version,
    title: doc.title,
    theme: doc.theme,
    pages: doc.pages.map((page) => ({
      id: page.id,
      title: page.title,
      blocks: page.blocks.map(clampBlock),
    })),
    confetti: doc.confetti,
    coin: doc.coin,
    parentId: doc.parentId ? String(doc.parentId).slice(0, PARENT_ID_MAX) : undefined,
    partner: doc.partner ? clampPartner(doc.partner) : undefined,
    forkable: doc.forkable === undefined ? true : Boolean(doc.forkable),
    embedMode:
      doc.embedMode === undefined
        ? undefined
        : EMBED_MODES.includes(doc.embedMode)
          ? doc.embedMode
          : 'snap-native',
    dataSource: doc.dataSource ? doc.dataSource.map(clampDataSource) : undefined,
  };
}

export function getPageIds(doc: SnapDoc): string[] {
  return doc.pages.map((p) => p.id);
}
