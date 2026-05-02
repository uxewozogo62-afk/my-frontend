import request from '../utils/request';
import type { User, HealthData, HealthTrendData, LocationData, GeofenceData, LocationHistoryData } from '../types';

/**
 * 认证相关 API
 * 注意：由于 request.ts 已经做了自动解包，Promise 返回的类型是后端返回的 data 字段
 */
export const authApi = {
  // 登录接口，返回包含 user 和 token 的对象
  login: (data: { username: string; password: string; role: string }): Promise<{ user: User; token: string }> => 
    request.post('/auth/login', data),
    
  // 注册接口
  register: (data: { username: string; password: string; role: string; name?: string; phone?: string }): Promise<User> => 
    request.post('/auth/register', data),
    
  // 获取当前登录用户信息
  getMe: (): Promise<User> => 
    request.get('/auth/me')
};

// 健康数据相关 API
export const healthApi = {
  getRealtime: (elderlyId: string): Promise<HealthData> => 
    request.get(`/health/realtime/${elderlyId}`),
    
  getHistory: (elderlyId: string): Promise<HealthData[]> => 
    request.get(`/health/history/${elderlyId}`),
    
  getTrend: (elderlyId: string): Promise<HealthTrendData> => 
    request.get(`/health/trends/${elderlyId}`)
};

// 位置信息相关 API
export const locationApi = {
  getRealtime: (elderlyId: string): Promise<LocationData> => 
    request.get(`/location/realtime/${elderlyId}`),
    
  getHistory: (elderlyId: string): Promise<LocationHistoryData[]> => 
    request.get(`/location/history/${elderlyId}`),
    
  getGeofence: (elderlyId: string): Promise<GeofenceData> => 
    request.get(`/location/geofence/${elderlyId}`),
    
  updateGeofence: (data: { elderlyId: string; name: string; centerLat: number; centerLng: number; radius: number; address: string }): Promise<GeofenceData> => 
    request.post('/location/geofence', data)
};

// 设备管理相关 API
export const deviceApi = {
  getList: (): Promise<any[]> => 
    request.get('/devices'),
    
  getDetail: (id: string): Promise<any> => 
    request.get(`/devices/${id}`),
    
  register: (data: any): Promise<any> => 
    request.post('/devices', data),
    
  heartbeat: (data: any): Promise<any> => 
    request.post('/devices/heartbeat', data)
};

// 管理员相关 API
export const adminApi = {
  getUsers: (): Promise<User[]> => 
    request.get('/admin/users'),
    
  getElderlyList: (): Promise<any[]> => 
    request.get('/admin/elderly'),
    
  getElderlyDetail: (id: string): Promise<any> => 
    request.get(`/admin/elderly/${id}`),
    
  updateEmergencyContact: (data: any): Promise<any> => 
    request.post('/admin/emergency-contacts', data)
};

// 警告系统相关 API
export const warningApi = {
  getList: (): Promise<any[]> => 
    request.get('/warnings'),
    
  getDetail: (id: string): Promise<any> => 
    request.get(`/warnings/${id}`),
    
  resolve: (id: string): Promise<any> => 
    request.put(`/warnings/${id}/resolve`),
    
  getStatistics: (): Promise<any> => 
    request.get('/warnings/statistics')
};
// 家属端相关 API (你现在最需要的)
export const familyApi = {
  /**
   * 根据家属 ID 获取关联的老人列表及其设备状态
   * 对应后端：/api/family/my-elderly/:userId
   */
  getMyElderly: (userId: string | number): Promise<any[]> => 
    request.get(`/family/my-elderly/${userId}`)
};
export default request;
