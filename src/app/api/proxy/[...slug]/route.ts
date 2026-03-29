import { NextRequest, NextResponse } from 'next/server';

// 브라우저 단에서 Mixed Content 에러를 피하기 위해, 브라우저는 이 라우터로 요청을 보내고 (HTTPS)
// 이 라우터가 백엔드(HTTP)로 포워딩합니다. (가장 얇고 멍청한 프록시)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://tlswltjq.iptime.org:8080';
const FALLBACK_BASE_URL = 'http://localhost:3000';

// 헬스체크 상태 캐싱
let isBackendUp = true;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 5000; // 5초간 헬스 상태 유지

async function checkBackendHealth(): Promise<boolean> {
  const now = Date.now();
  if (now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return isBackendUp;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2초 타임아웃
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    isBackendUp = res.ok;
    lastHealthCheck = now;
  } catch (error) {
    isBackendUp = false;
    lastHealthCheck = now;
  }

  return isBackendUp;
}

async function handleProxyRequest(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.slug ? resolvedParams.slug.join('/') : '';
  const searchParams = req.nextUrl.searchParams.toString();
  
  // 헬스체크로 메인 서버 상태 확인
  const isHealthy = await checkBackendHealth();
  
  // 건강하면 메인 서버, 죽었으면 폴백 서버(로컬호스트) 사용
  const baseUrl = isHealthy ? API_BASE_URL : FALLBACK_BASE_URL;
  const url = `${baseUrl}/api/v1/${path}${searchParams ? `?${searchParams}` : ''}`;

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  
  // 프론트엔드(axios intercepts localStorage)에서 보낸 Authorization 헤더 그대로 백엔드에 바통 터치
  const authHeader = req.headers.get('Authorization');
  if (authHeader) {
    headers.set('Authorization', authHeader);
  }

  try {
    let reqBody: string | undefined = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const text = await req.text();
      if (text) {
        reqBody = text;
      }
    }

    const res = await fetch(url, {
      method: req.method,
      headers,
      body: reqBody,
    });

    const data = await res.json().catch(() => null);
    
    // 백엔드의 응답 상태 코드와 데이터를 그대로 클라이언트에게 반환
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ message: 'Proxy Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleProxyRequest(req, context);
}
export async function POST(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleProxyRequest(req, context);
}
export async function PUT(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleProxyRequest(req, context);
}
export async function DELETE(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleProxyRequest(req, context);
}
export async function PATCH(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleProxyRequest(req, context);
}
