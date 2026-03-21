import axios from 'axios';

// 클라이언트 사이드에서는 Next.js 서버(또는 Rewrite) 경로로 요청합니다.
// 이후 Middleware에서 HttpOnly 쿠키의 토큰을 읽어 Authorization 헤더를 세팅한 뒤 백엔드로 포워딩합니다.
export const api = axios.create({
  baseURL: '/api/proxy',
  withCredentials: true, // 로컬 쿠키 포함 설정
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인터셉터는 기본적으로 토큰 갱신(Refresh) 로직을 위한 용도로 사용됩니다.
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized 에러 발생 및 재시도하지 않은 요청인 경우 토큰 재발급 시도
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post('/api/auth/reissue');
        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // 리프레시 토큰까지 만료된 경우 로그인 페이지로 리다이렉트 (클라이언트 사이드에서만 가능)
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
