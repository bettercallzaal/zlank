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
    description: 'Header, poll, and share button. Replace the question and options with your own.',
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
    description: 'Smallest possible Snap - one question, two options.',
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
    description: 'Chatbot collects what people are building. Replies inline. Logs every entry.',
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
              content: 'Read the log: zlank.online/api/chat-log/{snap-id}',
            },
          ],
        },
      ],
    },
  },
  {
    id: 'bug-report',
    name: 'Bug Report',
    description: 'Feedback block tagging the creator with a structured prefix.',
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
    description: 'Three-page intake walkthrough modeled on the official snap-catalog example.',
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
];

export function getTemplateById(id: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
