// Thin chat-completion wrapper. Minimax primary, Anthropic Haiku fallback.
// Both are optional - if no key set, caller falls back to a canned reply.

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Always wrap the caller's system prompt with this context. Stops the model
// from inventing unrelated context (e.g. "deepfake app from China") when the
// user's input is short and ambiguous.
const SYSTEM_PREFIX = `You are a chatbot embedded inside a Zlank Snap on Farcaster.
Zlank is a no-code Farcaster Snap builder at zlank.online. The user is a
Farcaster builder talking about something they're working on or interested in.
Reply in plain text only - no markdown, no code blocks, no <think> tags.
Keep replies to 1-2 sentences max. Never invent context the user didn't give you.`;

// Strip thinking-mode artifacts that some models (Minimax M2.7, Claude
// extended-thinking, DeepSeek R1) leak into output. Also collapse markdown
// fences and excess whitespace because Snap text blocks render plain text.
function sanitizeReply(raw: string): string {
  let out = raw;
  // Drop entire <think>...</think> blocks, including unclosed ones at the start.
  out = out.replace(/<think[\s\S]*?<\/think>/gi, '');
  out = out.replace(/^[\s\S]*?<\/think>/i, '');
  // Drop other reasoning-tag variants some models emit.
  out = out.replace(/<reasoning[\s\S]*?<\/reasoning>/gi, '');
  out = out.replace(/<thinking[\s\S]*?<\/thinking>/gi, '');
  // Drop fenced code blocks - Snap text doesn't render them.
  out = out.replace(/```[\s\S]*?```/g, '');
  // Collapse runs of whitespace/newlines to a single space, then trim.
  out = out.replace(/\s+/g, ' ').trim();
  return out;
}

const MINIMAX_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_URL =
  process.env.MINIMAX_API_URL || 'https://api.minimax.io/v1/chat/completions';
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || 'MiniMax-M2.7';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

function withZlankContext(messages: ChatMessage[]): ChatMessage[] {
  const callerSystem = messages.find((m) => m.role === 'system')?.content ?? '';
  const wrappedSystem = `${SYSTEM_PREFIX}\n\n${callerSystem}`.trim();
  const rest = messages.filter((m) => m.role !== 'system');
  return [{ role: 'system', content: wrappedSystem }, ...rest];
}

export async function chat(
  messages: ChatMessage[],
  opts: { maxTokens?: number; timeoutMs?: number } = {},
): Promise<string | null> {
  const maxTokens = opts.maxTokens ?? 200;
  const timeoutMs = opts.timeoutMs ?? 8000;
  const wrapped = withZlankContext(messages);

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
        body: JSON.stringify({ model: MINIMAX_MODEL, messages: wrapped, max_tokens: maxTokens }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const raw = data.choices?.[0]?.message?.content;
        if (raw) {
          const cleaned = sanitizeReply(raw);
          if (cleaned) return cleaned;
        }
      }
    } catch {
      // fall through to Anthropic
    }
  }

  if (ANTHROPIC_KEY) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeoutMs);
      const sys = wrapped.find((m) => m.role === 'system')?.content;
      const conv = wrapped.filter((m) => m.role !== 'system');
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
        const raw = data.content?.find((b) => b.type === 'text')?.text;
        if (raw) {
          const cleaned = sanitizeReply(raw);
          if (cleaned) return cleaned;
        }
      }
    } catch {
      // give up
    }
  }

  return null;
}

// Exported for unit tests.
export { sanitizeReply, withZlankContext };
