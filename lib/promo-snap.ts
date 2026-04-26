// The Zlank promo Snap - what cast embeds of zlank.vercel.app render as.
// Self-demonstrating: the homepage IS a Snap that shows what Zlank does.

const SNAP_MEDIA_TYPE = 'application/vnd.farcaster.snap+json';

export function buildPromoSnap(origin: string) {
  return {
    version: '1.0' as const,
    theme: { accent: 'amber' as const },
    ui: {
      root: 'page',
      elements: {
        page: {
          type: 'stack',
          props: { direction: 'vertical', gap: 'md' },
          children: ['header', 'desc', 'sep1', 'features', 'sep2', 'btn_build', 'btn_templates', 'btn_github', 'btn_share'],
        },
        header: {
          type: 'item',
          props: {
            title: 'Zlank',
            description: 'No-code builder for Farcaster Snaps',
          },
          children: ['badge'],
        },
        badge: {
          type: 'badge',
          props: { label: 'live', color: 'green' },
        },
        desc: {
          type: 'text',
          props: {
            content: 'Stack 14 block types. Hit Deploy. Share to feed. Cast renders as inline UI in Snap-aware clients.',
            size: 'md',
          },
        },
        sep1: { type: 'separator', props: {} },
        features: {
          type: 'text',
          props: {
            content: '14 blocks. 8 templates. Multi-page. Confetti. Open source. Any FID.',
            size: 'sm',
          },
        },
        sep2: { type: 'separator', props: {} },
        btn_build: {
          type: 'button',
          props: { label: 'Build a Snap', variant: 'primary', icon: 'plus' },
          on: { press: { action: 'open_url', params: { target: `${origin}/builder` } } },
        },
        btn_templates: {
          type: 'button',
          props: { label: 'Browse templates', icon: 'star' },
          on: { press: { action: 'open_url', params: { target: `${origin}/templates` } } },
        },
        btn_github: {
          type: 'button',
          props: { label: 'GitHub', icon: 'external-link' },
          on: { press: { action: 'open_url', params: { target: 'https://github.com/bettercallzaal/zlank' } } },
        },
        btn_share: {
          type: 'button',
          props: { label: 'Share Zlank', icon: 'share' },
          on: {
            press: {
              action: 'compose_cast',
              params: {
                text: 'no-code Farcaster Snap builder. stack blocks > deploy > share to feed',
                embeds: [origin],
              },
            },
          },
        },
      },
    },
  };
}

export const ZLANK_SNAP_MEDIA_TYPE = SNAP_MEDIA_TYPE;
