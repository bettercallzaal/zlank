import { NextRequest, NextResponse } from 'next/server';
import { setSnapCoin } from '@/lib/kv';

export const runtime = 'nodejs';

// POST /api/snaps/{id}/coin
// Body: { caip19: "eip155:8453/erc20:0x...", symbol?: "MYTOKEN" }
// or:   { clear: true } to remove the coin association.
//
// Updates BOTH the runtime snap key and the editable snapdoc key in Redis
// so the swap_token button auto-injects on next render.

const CAIP19_RE = /^eip155:\d+\/erc20:0x[a-fA-F0-9]{40}$/;

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  let body: { caip19?: string; symbol?: string; clear?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.clear) {
    const ok = await setSnapCoin(id, null);
    return NextResponse.json({ ok, cleared: true });
  }

  const caip19 = body.caip19?.trim();
  if (!caip19 || !CAIP19_RE.test(caip19)) {
    return NextResponse.json(
      { error: 'caip19 required, format eip155:CHAINID/erc20:0xADDRESS' },
      { status: 400 },
    );
  }
  const symbol = body.symbol?.trim().slice(0, 24);
  const ok = await setSnapCoin(id, { caip19, symbol });
  return NextResponse.json({ ok, coin: { caip19, symbol } });
}
