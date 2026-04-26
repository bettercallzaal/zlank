// Thin chat-completion wrapper. Minimax primary, Anthropic Haiku fallback.
// Both are optional - if no key set, caller falls back to a canned reply.

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const MINIMAX_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_URL =
  process.env.MINIMAX_API_URL || 'https://api.minimax.io/v1/chat/completions';
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || 'MiniMax-M2.7';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

export async function chat(
  messages: ChatMessage[],
  opts: { maxTokens?: number; timeoutMs?: number } = {},
): Promise<string | null> {
  const maxTokens = opts.maxTokens ?? 200;
  const timeoutMs = opts.timeoutMs ?? 8000;

  if (MINIMAX_KEY) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      const res = await fetch(MINIMAX_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${MINIMAX_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: MINIMAX_MODEL, messages, max_tokens: maxTokens }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch {
      // fall through to Anthropic
    }
  }

  if (ANTHROPIC_KEY) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      const sys = messages.find((m) => m.role === 'system')?.content;
      const conv = messages.filter((m) => m.role !== 'system');
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: maxTokens,
          system: sys,
          messages: conv,
        }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = (await res.json()) as {
          content?: Array<{ type: string; text?: string }>;
        };
        const text = data.content?.find((b) => b.type === 'text')?.text?.trim();
        if (text) return text;
      }
    } catch {
      // give up
    }
  }

  return null;
}
