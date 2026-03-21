import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://tlswltjq.iptime.org:8080';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  // slug param allows dynamic subpaths (e.g. /api/proxy/finance/accounts/general)
  const resolvedParams = await params;
  return handleProxyRequest(req, resolvedParams.slug);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(req, resolvedParams.slug);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(req, resolvedParams.slug);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  return handleProxyRequest(req, resolvedParams.slug);
}

async function handleProxyRequest(req: NextRequest, slug: string[]) {
  const token = req.cookies.get('accessToken')?.value;
  const path = slug ? slug.join('/') : '';
  const searchParams = req.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}/api/v1/${path}${searchParams ? `?${searchParams}` : ''}`;

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, {
      method: req.method,
      headers,
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(await req.json()) : undefined,
    });

    const data = await res.json().catch(() => null);
    
    // Unauthorized 처리 등 세분화 가능
    if (res.status === 401) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ message: 'Proxy Error' }, { status: 500 });
  }
}
