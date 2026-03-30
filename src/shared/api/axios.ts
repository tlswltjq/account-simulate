import axios from 'axios';

export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080/api/v1' 
  : '/api/proxy';

// 배포 환경에서는 같은 도메인의 /api/proxy 라우트로 요청을 보냅니다.
// 하지만 로컬 개발 도중에는 직접 백엔드(localhost:8080)를 호출합니다.
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // 프록시로 보냄
    }
  }
  return config;
});

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
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // reissue를 전송할 때도 환경에 따라 동적인 Base URL 사용
        const { data } = await axios.post(`${API_BASE_URL}/auth/reissue`, { refreshToken });
        
        const newAccessToken = data.data?.accessToken;
        const newRefreshToken = data.data?.refreshToken;

        if (newAccessToken) localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/signup') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
