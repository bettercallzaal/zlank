import type { SnapDoc } from './blocks';

export type TemplateCategory =
  | 'sports'
  | 'tokens'
  | 'mint'
  | 'subscribe'
  | 'predict'
  | 'community'
  | 'generic';

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  doc: SnapDoc;
  /** Co-branding partner, when this is a partner-signature template. */
  partner?: { id: string; name: string };
  category?: TemplateCategory;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'fan-vote',
    name: 'Fan Vote',
    description: 'Poll + share. Live tally after voting.',
    doc: {
      version: 1,
      title: 'Fan Vote',
      theme: 'purple',
      pages: [
        {
          id: 'home',
          blocks: [
            {
              type: 'header',
              title: 'What should we ship next?',
              subtitle: 'Pick one. Live tally after you vote.',
            },
            {
              type: 'poll',
              question: 'Vote your pick',
              options: ['New track', 'New merch', 'New tour date'],
            },
            {
              type: 'share',
              label: 'Share with friends',
              text: 'Help me decide what to ship next',
              icon: 'share',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'music-drop',
    name: 'Music Drop',
    description: 'New track + artist link + share button.',
    doc: {
      version: 1,
      title: 'Music Drop',
      theme: 'amber',
      pages: [
        {
          id: 'home',
          blocks: [
            {
              type: 'header',
              title: 'New track is out',
              subtitle: 'Tap Listen to open in your player',
            },
            {
              type: 'music',
              url: 'https://open.spotify.com/album/4LH4d3cOWNNsVw41Gqt2kv',
              label: 'Listen now',
              icon: 'play',
            },
            {
              type: 'artist',
              fid: 19640,
              displayName: 'Replace with your FC handle',
              label: 'View artist profile',
            },
            {
              type: 'share',
              label: 'Share the drop',
              text: 'New track out now',
              icon: 'share',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'fundraiser',
    name: 'Fundraiser',
    description: 'Top supporters chart + contribute link.',
    doc: {
      version: 1,
      title: 'Fundraiser',
      theme: 'green',
      pages: [
        {
          id: 'home',
          blocks: [
            {
              type: 'header',
              title: 'Support our mission',
              subtitle: 'Top supporters this round',
            },
            {
              type: 'chart',
              title: 'Top supporters',
              bars: [
                { label: 'Alice', value: 50 },
                { label: 'Bob', value: 30 },
                { label: 'Carol', value: 20 },
              ],
            },
            {
              type: 'link',
              label: 'Contribute',
              url: 'https://www.thezao.com',
              icon: 'gift',
              variant: 'primary',
            },
            {
              type: 'share',
              label: 'Share campaign',
              text: 'Help us hit our goal',
              icon: 'share',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'event-rsvp',
    name: 'Event RSVP',
    description: 'Event details + RSVP + share invite.',
    doc: {
      version: 1,
      title: 'Event RSVP',
      theme: 'blue',
      pages: [
        {
          id: 'home',
          blocks: [
            {
              type: 'header',
              title: 'You are invited',
              subtitle: 'Join us for the night',
            },
            {
              type: 'text',
              content: 'Date: Sat May 15\nTime: 7-11 PM\nLocation: TBA - check the link',
            },
            {
              type: 'link',
              label: 'RSVP on Lu.ma',
              url: 'https://lu.ma',
              icon: 'external-link',
              variant: 'primary',
            },
            {
              type: 'share',
              label: 'Bring a friend',
              text: 'Going to this',
              icon: 'share',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'top-of-week',
    name: 'Top of the Week',
    description: 'Top 7 leaderboard chart + share.',
    doc: {
      version: 1,
      title: 'Top of the Week',
      theme: 'amber',
      pages: [
        {
          id: 'home',
          blocks: [
            {
              type: 'header',
              title: 'Top 7 this week',
              subtitle: 'Replace the names + values with your own',
            },
            {
              type: 'chart',
              title: 'Weekly leaderboard',
              bars: [
                { label: 'Alice', value: 95 },
                { label: 'Bob', value: 87 },
                { label: 'Carol', value: 76 },
                { label: 'Dave', value: 65 },
                { label: 'Eve', value: 54 },
                { label: 'Frank', value: 43 },
                { label: 'Grace', value: 32 },
              ],
            },
            {
              type: 'share',
              label: 'Share leaderboard',
              text: 'This weeks top 7',
              icon: 'share',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'two-truths-lie',
    name: 'Two Truths and a Lie',
    description: 'Toggle game with confetti on submit.',
    doc: {
      version: 1,
      title: 'Two Truths and a Lie',
      theme: 'pink',
      confetti: true,
      pages: [
        {
          id: 'home',
          blocks: [
            {
              type: 'header',
              title: 'Two truths and a lie',
              subtitle: 'Guess which one is false',
            },
            {
              type: 'toggle',
              label: 'Tap the lie',
              options: [
                'I have met every ZAO member',
                'I built a Snap in 90 seconds',
                'I once shipped 5 PRs in one day',
              ],
              orientation: 'vertical',
            },
            {
              type: 'share',
              label: 'Challenge a friend',
              text: 'Two truths and a lie - guess the lie',
              icon: 'share',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'member-welcome',
    name: 'Member Welcome',
    description: 'Onboarding header + 3 link buttons.',
    doc: {
      version: 1,
      title: 'Welcome to the Community',
      theme: 'teal',
      pages: [
        {
          id: 'home',
          blocks: [
            {
              type: 'header',
              title: 'Welcome aboard',
              subtitle: 'Three quick links to get you started',
            },
            {
              type: 'text',
              content: 'Replace these links with your own onboarding resources.',
            },
            {
              type: 'link',
              label: 'Read the handbook',
              url: 'https://www.thezao.com',
              icon: 'external-link',
              variant: 'primary',
            },
            {
              type: 'link',
              label: 'Join the chat',
              url: 'https://farcaster.xyz/~/channel/thezao',
              icon: 'message-circle',
              variant: 'primary',
            },
            {
              type: 'link',
              label: 'See the roadmap',
              url: 'https://github.com/bettercallzaal/zlank',
              icon: 'external-link',
              variant: 'secondary',
            },
            {
              type: 'share',
              label: 'Bring a friend',
              text: 'Just joined - come hang',
              icon: 'share',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'quick-poll',
    name: 'Quick Poll',
    description: 'Smallest Snap - 1 question, 2 options.',
    doc: {
      version: 1,
      title: 'Quick poll',
      theme: 'red',
      pages: [
        {
          id: 'home',
          blocks: [
            {
              type: 'header',
              title: 'Quick check',
              subtitle: 'Yes or no - takes one tap',
            },
            {
              type: 'poll',
              question: 'Should we ship it?',
              options: ['Yes', 'No'],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'idea-box',
    name: 'Idea Box',
    description: 'Chatbot logs ideas + replies inline.',
    doc: {
      version: 1,
      title: 'What are you building?',
      theme: 'purple',
      pages: [
        {
          id: 'home',
          blocks: [
            {
              type: 'header',
              title: 'Tell me what you are building',
              subtitle: 'Reply comes back inline. Logged for the creator.',
              badgeText: 'IDEAS',
              badgeColor: 'purple',
            },
            {
              type: 'chatbot',
              title: 'Builder chat',
              prompt: 'What are you working on right now?',
              systemPrompt:
                'You are a friendly product coach. Reply briefly (max 2 sentences) and ask one curious follow-up about what they are making. Be concrete.',
              label: 'Send',
              placeholder: 'Type your idea...',
            },
            { type: 'divider' },
            {
              type: 'text',
              content: 'Every entry logs to your dashboard for follow-up.',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'bug-report',
    name: 'Bug Report',
    description: 'Feedback block that tags the creator.',
    doc: {
      version: 1,
      title: 'Bug report',
      theme: 'red',
      pages: [
        {
          id: 'home',
          blocks: [
            {
              type: 'header',
              title: 'Found a bug?',
              subtitle: 'Tell us what broke. One tap to send.',
              badgeText: 'BUGS',
              badgeColor: 'red',
            },
            {
              type: 'feedback',
              label: 'Send bug report',
              prompt: 'Describe the bug + how to reproduce it',
              mention: 'zaal',
              prefix: 'bug for zlank:',
            },
            { type: 'divider' },
            {
              type: 'text',
              content: 'Tagged @zaal. Composer opens pre-filled - review and send.',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'multi-step-form',
    name: 'Multi-step Form',
    description: '3-page intake form. Shows multi-page nav.',
    doc: {
      version: 1,
      title: 'Tell us about your build',
      theme: 'blue',
      pages: [
        {
          id: 'home',
          blocks: [
            {
              type: 'header',
              title: 'Step 1 of 3',
              subtitle: 'What are you working on?',
              badgeText: '1/3',
              badgeColor: 'blue',
            },
            {
              type: 'feedback',
              label: 'Continue',
              prompt: 'Pitch your idea in one line',
              mention: 'zaal',
              prefix: 'multi-step intake:',
            },
            {
              type: 'navigate',
              label: 'Next: pick a category',
              pageId: 'category',
              icon: 'chevron-right',
              variant: 'primary',
            },
          ],
        },
        {
          id: 'category',
          blocks: [
            {
              type: 'header',
              title: 'Step 2 of 3',
              subtitle: 'Pick the closest category',
              badgeText: '2/3',
              badgeColor: 'blue',
            },
            {
              type: 'poll',
              question: 'Category',
              options: ['Music', 'Tooling', 'Community', 'Other'],
            },
            {
              type: 'navigate',
              label: 'Next: how soon to ship',
              pageId: 'timeline',
              icon: 'chevron-right',
              variant: 'primary',
            },
          ],
        },
        {
          id: 'timeline',
          blocks: [
            {
              type: 'header',
              title: 'Step 3 of 3',
              subtitle: 'Timeline',
              badgeText: '3/3',
              badgeColor: 'blue',
            },
            {
              type: 'slider',
              label: 'Days to ship',
              min: 1,
              max: 30,
              defaultValue: 7,
            },
            {
              type: 'switch',
              label: 'Open-source by default',
              defaultChecked: true,
            },
            {
              type: 'text',
              content: 'Thanks. Each step logs separately - check the chat log for the full thread.',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'footy-match-day',
    name: 'Match Day',
    description: 'Live scoreboard + odds + share. Powered by Footy App.',
    partner: { id: 'footy', name: 'Footy App' },
    category: 'sports',
    doc: {
      version: 2,
      title: 'Match Day',
      theme: 'green',
      partner: { id: 'footy', name: 'Footy App', attribution: true, url: 'https://fc-footy.vercel.app' },
      forkable: true,
      embedMode: 'iframe',
      dataSource: [
        { id: 'match', kind: 'rest', url: 'https://fc-footy.vercel.app/api/match/REPLACE_ME', refreshSec: 30 },
        { id: 'odds', kind: 'rest', url: 'https://fc-footy.vercel.app/api/odds/REPLACE_ME', refreshSec: 60 },
      ],
      pages: [
        {
          id: 'home',
          blocks: [
            { type: 'header', title: 'Match Day', subtitle: 'Live now', badgeText: 'LIVE', badgeColor: 'green' },
            { type: 'liveScore', home: 'Home', away: 'Away', dataSourceId: 'match', showMinute: true },
            {
              type: 'oddsTicker',
              market: 'Match Winner',
              legs: [
                { label: 'Home', odds: '2.10' },
                { label: 'Draw', odds: '3.40' },
                { label: 'Away', odds: '3.20' },
              ],
              dataSourceId: 'odds',
            },
            { type: 'share', label: 'Bring a friend', text: 'Watching this match - join the cast', icon: 'share' },
            { type: 'link', label: 'Open in Footy App', url: 'https://fc-footy.vercel.app', icon: 'external-link', variant: 'primary' },
          ],
        },
      ],
    },
  },
  {
    id: 'clanker-token-launch',
    name: 'Token Launch',
    description: 'One-tap community token deploy. Powered by Clanker.',
    partner: { id: 'clanker', name: 'Clanker' },
    category: 'tokens',
    doc: {
      version: 2,
      title: 'Launch your token',
      theme: 'amber',
      partner: { id: 'clanker', name: 'Clanker', attribution: true, url: 'https://clanker.world' },
      forkable: true,
      embedMode: 'iframe',
      pages: [
        {
          id: 'home',
          blocks: [
            { type: 'header', title: 'Launch a community token', subtitle: 'Deploys on Base in one tap', badgeText: 'TOKENS', badgeColor: 'amber' },
            { type: 'tokenDeploy', name: 'My Token', symbol: 'MYTOK', description: 'Replace with your token details before sharing.', clankerVersion: 'v4' },
            { type: 'text', content: 'Edit the name, symbol, and description, then share to feed.' },
            { type: 'share', label: 'Share the launch', text: 'Just launched a token', icon: 'share' },
          ],
        },
      ],
    },
  },
  {
    id: 'zora-coin-this-cast',
    name: 'Coin This Cast',
    description: 'Turn a post into a tradeable coin. Powered by Zora.',
    partner: { id: 'zora', name: 'Zora' },
    category: 'tokens',
    doc: {
      version: 2,
      title: 'Coin this cast',
      theme: 'purple',
      partner: { id: 'zora', name: 'Zora', attribution: true, url: 'https://zora.co' },
      forkable: true,
      embedMode: 'iframe',
      pages: [
        {
          id: 'home',
          blocks: [
            { type: 'header', title: 'Coin this cast', subtitle: 'Every post can be a coin', badgeText: 'ZORA', badgeColor: 'purple' },
            { type: 'coinPost', postId: 'REPLACE_WITH_ZORA_COIN_ID', showHolders: true, showPrice: true, buyButton: true, zoraUrl: 'https://zora.co' },
            { type: 'text', content: 'Replace the coin id with your Zora post coin, then share.' },
            { type: 'share', label: 'Share the coin', text: 'Coined this post on Zora', icon: 'share' },
          ],
        },
      ],
    },
  },
  {
    id: 'hypersub-creator-subscription',
    name: 'Creator Subscription',
    description: 'Onchain recurring subscription. Powered by Hypersub.',
    partner: { id: 'hypersub', name: 'Hypersub' },
    category: 'subscribe',
    doc: {
      version: 2,
      title: 'Subscribe',
      theme: 'blue',
      partner: { id: 'hypersub', name: 'Hypersub', attribution: true, url: 'https://hypersub.xyz' },
      forkable: true,
      embedMode: 'iframe',
      pages: [
        {
          id: 'home',
          blocks: [
            { type: 'header', title: 'Subscribe to my work', subtitle: 'Onchain, recurring, cancel anytime', badgeText: 'SUBS', badgeColor: 'blue' },
            { type: 'text', content: 'Subscribers get gated posts and drops. Replace the contract address with your STP contract.' },
            {
              type: 'subscribeButton',
              label: 'Subscribe - 30 days',
              subContractAddress: '0x0000000000000000000000000000000000000000',
              chainId: 8453,
              durationDays: 30,
              priceCurrency: 'USDC',
            },
            { type: 'share', label: 'Share', text: 'Just opened subscriptions', icon: 'share' },
          ],
        },
      ],
    },
  },
  {
    id: 'polymarket-prediction',
    name: 'Prediction Market',
    description: 'Embed a live market + share. Powered by Polymarket.',
    partner: { id: 'polymarket', name: 'Polymarket' },
    category: 'predict',
    doc: {
      version: 2,
      title: 'Will it happen?',
      theme: 'teal',
      partner: { id: 'polymarket', name: 'Polymarket', attribution: true, url: 'https://polymarket.com' },
      forkable: true,
      embedMode: 'iframe',
      pages: [
        {
          id: 'home',
          blocks: [
            { type: 'header', title: 'Make your prediction', subtitle: 'Live market odds', badgeText: 'PREDICT', badgeColor: 'teal' },
            { type: 'marketEmbed', marketSlug: 'replace-with-market-slug', source: 'polymarket', showOdds: true, showVolume: true, betButton: true },
            { type: 'share', label: 'Share the market', text: 'What do you think happens here?', icon: 'share' },
          ],
        },
      ],
    },
  },
  {
    id: 'bountycaster-task-board',
    name: 'Bounty Board',
    description: 'Post a bounty with escrow. Powered by Bountycaster.',
    partner: { id: 'bountycaster', name: 'Bountycaster' },
    category: 'community',
    doc: {
      version: 2,
      title: 'Bounty board',
      theme: 'green',
      partner: { id: 'bountycaster', name: 'Bountycaster', attribution: true, url: 'https://bountycaster.xyz' },
      forkable: true,
      embedMode: 'iframe',
      pages: [
        {
          id: 'home',
          blocks: [
            { type: 'header', title: 'Open bounty', subtitle: 'Claim it, ship it, get paid', badgeText: 'BOUNTY', badgeColor: 'green' },
            {
              type: 'bountyEscrow',
              title: 'Build the thing',
              description: 'Replace this with the task scope and acceptance criteria.',
              amountUsd: 250,
              bountycasterUrl: 'https://bountycaster.xyz',
            },
            { type: 'text', content: 'Edit the task, amount, and link, then share to find a hunter.' },
          ],
        },
      ],
    },
  },
  {
    id: 'highlight-mint-drop',
    name: 'Mint Drop',
    description: 'In-feed NFT mint. Powered by Highlight.',
    partner: { id: 'highlight', name: 'Highlight' },
    category: 'mint',
    doc: {
      version: 2,
      title: 'Mint drop',
      theme: 'pink',
      partner: { id: 'highlight', name: 'Highlight', attribution: true, url: 'https://highlight.xyz' },
      forkable: true,
      embedMode: 'iframe',
      pages: [
        {
          id: 'home',
          blocks: [
            { type: 'header', title: 'New drop is live', subtitle: 'Mint straight from the feed', badgeText: 'MINT', badgeColor: 'pink' },
            { type: 'text', content: 'Replace the contract address with your Highlight collection.' },
            {
              type: 'mintButton',
              label: 'Mint now',
              contractAddress: '0x0000000000000000000000000000000000000000',
              chainId: 8453,
              partnerId: 'highlight',
            },
            { type: 'share', label: 'Share the drop', text: 'New mint is live', icon: 'share' },
          ],
        },
      ],
    },
  },
  {
    id: 'defifa-prediction-game',
    name: 'Prediction Game',
    description: 'Multi-round bracket pick. Powered by Defifa.',
    partner: { id: 'defifa', name: 'Defifa' },
    category: 'predict',
    doc: {
      version: 2,
      title: 'Prediction game',
      theme: 'amber',
      partner: { id: 'defifa', name: 'Defifa', attribution: true, url: 'https://defifa.net' },
      forkable: true,
      embedMode: 'iframe',
      pages: [
        {
          id: 'home',
          blocks: [
            { type: 'header', title: 'Round 1', subtitle: 'Pick the winner', badgeText: '1/2', badgeColor: 'amber' },
            { type: 'poll', question: 'Who wins the semi-final?', options: ['Team A', 'Team B'] },
            { type: 'navigate', label: 'Next: the final', pageId: 'final', icon: 'chevron-right', variant: 'primary' },
          ],
        },
        {
          id: 'final',
          blocks: [
            { type: 'header', title: 'Round 2', subtitle: 'Pick the champion', badgeText: '2/2', badgeColor: 'amber' },
            { type: 'poll', question: 'Who lifts the trophy?', options: ['Team A', 'Team B', 'Team C', 'Team D'] },
            { type: 'share', label: 'Challenge a friend', text: 'Made my picks - what are yours?', icon: 'share' },
          ],
        },
      ],
    },
  },
  {
    id: 'empirebuilder-treasury-board',
    name: 'Treasury Board',
    description: 'Top holders leaderboard + treasury link. Powered by Empire Builder.',
    partner: { id: 'empirebuilder', name: 'Empire Builder' },
    category: 'community',
    doc: {
      version: 2,
      title: 'Treasury board',
      theme: 'blue',
      partner: { id: 'empirebuilder', name: 'Empire Builder', attribution: true, url: 'https://www.empirebuilder.world' },
      forkable: true,
      embedMode: 'iframe',
      pages: [
        {
          id: 'home',
          blocks: [
            { type: 'header', title: 'Community treasury', subtitle: 'Top holders this round', badgeText: 'TREASURY', badgeColor: 'blue' },
            {
              type: 'chart',
              title: 'Top holders',
              bars: [
                { label: 'Alice', value: 95 },
                { label: 'Bob', value: 72 },
                { label: 'Carol', value: 54 },
              ],
            },
            { type: 'link', label: 'View the treasury', url: 'https://www.empirebuilder.world', icon: 'external-link', variant: 'primary' },
            { type: 'share', label: 'Share the board', text: 'Check our community treasury', icon: 'share' },
          ],
        },
      ],
    },
  },
];

export function getTemplateById(id: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/** Every template co-branded with the given partner. */
export function getTemplatesByPartner(partnerId: string): TemplateMeta[] {
  return TEMPLATES.filter((t) => t.partner?.id === partnerId);
}

/** Every distinct partner that has at least one signature template. */
export function listTemplatePartners(): Array<{ id: string; name: string }> {
  const seen = new Map<string, string>();
  for (const t of TEMPLATES) {
    if (t.partner) seen.set(t.partner.id, t.partner.name);
  }
  return [...seen].map(([id, name]) => ({ id, name }));
}

// Allowlist for partner.id on saved SnapDocs. partner.id is user-set, so without
// this anyone could claim attribution and poison the partner index. Composed of
// every partner that ships at least one template plus internal-only buckets.
const INTERNAL_PARTNER_IDS = ['zlank-feedback'] as const;

export const KNOWN_PARTNER_IDS: ReadonlySet<string> = new Set<string>([
  ...TEMPLATES.flatMap((t) => (t.partner ? [t.partner.id] : [])),
  ...INTERNAL_PARTNER_IDS,
]);

export function isKnownPartnerId(id: string | undefined): boolean {
  return typeof id === 'string' && KNOWN_PARTNER_IDS.has(id);
}
