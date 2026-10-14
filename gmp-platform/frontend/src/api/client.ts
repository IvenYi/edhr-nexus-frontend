import axios from 'axios';
import type { ApiResponse } from '@/types/common';
import { clearAuthStorage } from '@/utils/sessionPolicy';
import { getSessionGeneration } from '@/utils/queryClient';
import { showDeletionProtection } from './deletionProtection';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
    authSessionGeneration?: number;
  }
}

const client = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
client.interceptors.request.use(
  (config) => {
    config.authSessionGeneration = getSessionGeneration();
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => { throw error; },
  { synchronous: true },
);

// Response interceptor: unwrap ApiResponse, handle 401
client.interceptors.response.use(
  (response) => {
    if (response.config.authSessionGeneration !== getSessionGeneration()) {
      return Promise.reject(new axios.CanceledError('登录会话已切换，请重新操作'));
    }
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response;
    }
    const body = response.data as ApiResponse<unknown>;
    if (body.code !== 200) {
      return Promise.reject(new Error(body.message || 'Request failed'));
    }
    return response;
  },
  (error) => {
    if (error.config?.authSessionGeneration !== undefined &&
        error.config.authSessionGeneration !== getSessionGeneration()) {
      return Promise.reject(new axios.CanceledError('登录会话已切换，请重新操作'));
    }
    if (error.response?.status === 409) showDeletionProtection(error.response?.data?.data);
    const apiMessage = (error.response?.data as Partial<ApiResponse<unknown>> | undefined)?.message;
    if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
      clearAuthStorage();
      window.location.href = '/login';
    }
    return Promise.reject(new Error(apiMessage || error.message || '请求失败'));
  },
);

export default client;
