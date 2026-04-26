import type { SnapDoc } from './blocks';

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  doc: SnapDoc;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'fan-vote',
    name: 'Fan Vote',
    description: 'Header, poll, and share button for quick voting',
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
              title: 'What should we do next?',
              subtitle: 'Cast your vote below',
            },
            {
              type: 'poll',
              question: 'Pick your favorite option',
              options: ['Option A', 'Option B', 'Option C'],
            },
            {
              type: 'share',
              label: 'Share vote',
              text: 'Just voted on this poll',
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
    description: 'Announce a new track with artist and share',
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
              title: 'New Track Released',
              subtitle: 'Available now on all platforms',
            },
            {
              type: 'music',
              url: 'https://open.spotify.com/track/',
              label: 'Listen on Spotify',
              icon: 'play',
            },
            {
              type: 'artist',
              fid: 19640,
              displayName: 'Artist Name',
              label: 'View Artist',
            },
            {
              type: 'share',
              label: 'Share Track',
              text: 'Just dropped a new track',
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
    description: 'Progress chart for fundraising campaign',
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
              title: 'Support Our Mission',
              subtitle: 'Help us reach our goal',
            },
            {
              type: 'chart',
              title: 'Top Supporters',
              bars: [
                { label: 'Alice', value: 50 },
                { label: 'Bob', value: 30 },
                { label: 'Carol', value: 20 },
              ],
            },
            {
              type: 'link',
              label: 'Contribute Now',
              url: 'https://example.com/donate',
              icon: 'gift',
              variant: 'primary',
            },
            {
              type: 'share',
              label: 'Share',
              text: 'Supporting this cause',
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
    description: 'Simple event announcement with RSVP link',
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
              title: 'You are Invited',
              subtitle: 'Join us for an unforgettable evening',
            },
            {
              type: 'text',
              content: 'Date: Saturday, May 15\nTime: 7:00 PM - 11:00 PM\nLocation: Main Event Space',
            },
            {
              type: 'link',
              label: 'RSVP Now',
              url: 'https://example.com/rsvp',
              icon: 'external-link',
              variant: 'primary',
            },
            {
              type: 'share',
              label: 'Share Event',
              text: 'Going to this event',
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
    description: 'Showcase top weekly performers',
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
              title: 'This Week Top 7',
              subtitle: 'The hottest performers this week',
            },
            {
              type: 'chart',
              title: 'Weekly Leaderboard',
              bars: [
                { label: 'Artist 1', value: 95 },
                { label: 'Artist 2', value: 87 },
                { label: 'Artist 3', value: 76 },
                { label: 'Artist 4', value: 65 },
                { label: 'Artist 5', value: 54 },
                { label: 'Artist 6', value: 43 },
                { label: 'Artist 7', value: 32 },
              ],
            },
            {
              type: 'share',
              label: 'Share Leaderboard',
              text: 'Check out this week top performers',
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
    description: 'Interactive game with confetti reveal',
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
              title: 'Two Truths and a Lie',
              subtitle: 'Guess which one is false',
            },
            {
              type: 'toggle',
              label: 'Pick one statement',
              options: ['Statement 1', 'Statement 2', 'Statement 3'],
              orientation: 'vertical',
            },
            {
              type: 'share',
              label: 'Share Game',
              text: 'Playing two truths and a lie',
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
    description: 'Onboard new members with links',
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
              title: 'Welcome Aboard',
              subtitle: 'Glad to have you on the team',
            },
            {
              type: 'text',
              content: 'Here are some helpful resources to get you started:',
            },
            {
              type: 'link',
              label: 'Read the Handbook',
              url: 'https://example.com/handbook',
              icon: 'external-link',
              variant: 'primary',
            },
            {
              type: 'link',
              label: 'Join Discord',
              url: 'https://discord.gg/example',
              icon: 'external-link',
              variant: 'primary',
            },
            {
              type: 'link',
              label: 'View Roadmap',
              url: 'https://example.com/roadmap',
              icon: 'external-link',
              variant: 'primary',
            },
            {
              type: 'share',
              label: 'Share Welcome',
              text: 'Just joined this amazing community',
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
    description: 'Simple header and poll combo',
    doc: {
      version: 1,
      title: 'Quick Poll',
      theme: 'red',
      pages: [
        {
          id: 'home',
          blocks: [
            {
              type: 'header',
              title: 'Quick Poll',
              subtitle: 'What is your preference?',
            },
            {
              type: 'poll',
              question: 'Choose one',
              options: ['Yes', 'No'],
            },
          ],
        },
      ],
    },
  },
];

export function getTemplateById(id: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
