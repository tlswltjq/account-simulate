import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://tlswltjq.iptime.org:8080';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/auth/reissue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || (data && data.status !== 'success')) {
      return NextResponse.json(data || { message: 'Reissue failed' }, { status: 401 });
    }

    const newAccessToken = data.data?.accessToken;
    const newRefreshToken = data.data?.refreshToken;

    const response = NextResponse.json({ message: 'Token reissued successfully' }, { status: 200 });

    if (newAccessToken) {
      response.cookies.set({
        name: 'accessToken',
        value: newAccessToken,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 30, // 30분
      });
    }

    if (newRefreshToken) {
      response.cookies.set({
        name: 'refreshToken',
        value: newRefreshToken,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7일
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
