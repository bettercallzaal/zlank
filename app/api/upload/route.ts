import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

export const runtime = 'nodejs';

// POST /api/upload  multipart/form-data with field "file"
// Returns { url } pointing at a public Vercel Blob URL.
// Requires BLOB_READ_WRITE_TOKEN env (auto when Vercel Blob added to project).

const MAX_BYTES = 4 * 1024 * 1024; // 4 MiB
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Image upload disabled - BLOB_READ_WRITE_TOKEN not set on server.' },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'multipart/form-data required' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'missing file field' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `file too large (max ${MAX_BYTES} bytes)` },
      { status: 413 },
    );
  }
  if (file.type && !ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: `unsupported type ${file.type}` },
      { status: 415 },
    );
  }

  const ext = (file.type.split('/')[1] || 'bin').replace(/\W/g, '');
  const key = `zlank/images/${nanoid(10)}.${ext}`;
  try {
    const blob = await put(key, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type || 'application/octet-stream',
    });
    return NextResponse.json({ url: blob.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'upload failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
