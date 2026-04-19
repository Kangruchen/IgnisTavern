import { NextRequest, NextResponse } from 'next/server';

// In-memory save storage (use Redis/DB in production)
const saveMap = new Map<string, string>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { saveId, data } = body;

    if (!saveId || !data) {
      return NextResponse.json({ error: 'Missing saveId or data' }, { status: 400 });
    }

    const key = `${getClientIp(request)}:${saveId}`;
    saveMap.set(key, JSON.stringify(data));

    return NextResponse.json({ success: true, saveId });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const saveId = url.searchParams.get('saveId');

  if (!saveId) {
    return NextResponse.json({ error: 'Missing saveId parameter' }, { status: 400 });
  }

  const key = `${getClientIp(request)}:${saveId}`;
  const data = saveMap.get(key);

  if (!data) {
    return NextResponse.json({ error: 'Save not found' }, { status: 404 });
  }

  try {
    return NextResponse.json({ saveId, data: JSON.parse(data) });
  } catch {
    return NextResponse.json({ error: 'Corrupted save data' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const saveId = url.searchParams.get('saveId');

  if (!saveId) {
    return NextResponse.json({ error: 'Missing saveId parameter' }, { status: 400 });
  }

  const key = `${getClientIp(request)}:${saveId}`;
  saveMap.delete(key);

  return NextResponse.json({ success: true });
}
