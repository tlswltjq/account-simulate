import axios from 'axios';

// 브라우저의 Mixed Content 브록(보안)을 피하기 위해, 같은 도메인의 /api/proxy 라우트로 모든 요청을 보냅니다.
export const api = axios.create({
  baseURL: '/api/proxy',
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

        // 프록시 라우터로 reissue 전송
        const { data } = await axios.post('/api/proxy/auth/reissue', { refreshToken });
        
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
