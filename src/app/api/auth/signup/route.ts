import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://tlswltjq.iptime.org:8080';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || (data && data.status !== 'success')) {
      return NextResponse.json(data || { message: 'Signup failed' }, { status: res.status });
    }

    return NextResponse.json({ message: 'Signed up successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
