import axios from 'axios';
import { message } from 'ant-design-vue';

// 创建 axios 实例
const service = axios.create({
  baseURL: 'https://my-backend-931i.onrender.com/api', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
} );

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data; 
    if (res.code !== 200) {
      message.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res.data; 
  },
  (error) => {
    const errorMsg = error.response?.data?.message || '网络错误或服务器未启动';
    message.error(errorMsg);
    return Promise.reject(error);
  }
);

export default service;
