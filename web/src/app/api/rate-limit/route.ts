import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (falls back when no Redis)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const DAILY_LIMIT = 50;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

function getResetTime(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const now = Date.now();

  let entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: getResetTime() };
    rateLimitMap.set(ip, entry);
  }

  const remaining = Math.max(0, DAILY_LIMIT - entry.count);

  return NextResponse.json({
    limit: DAILY_LIMIT,
    used: entry.count,
    remaining,
    resetAt: entry.resetAt,
  });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const now = Date.now();

  let entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: getResetTime() };
    rateLimitMap.set(ip, entry);
  }

  if (entry.count >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: '每日免费次数已用完，请输入自己的 API Key 继续', remaining: 0 },
      { status: 429 }
    );
  }

  entry.count++;
  rateLimitMap.set(ip, entry);

  return NextResponse.json({
    remaining: DAILY_LIMIT - entry.count,
    used: entry.count,
  });
}
