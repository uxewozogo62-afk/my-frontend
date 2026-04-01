// 定义后端通用的返回结构
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 定义用户类型
export interface User {
  _id: number; // 适配数据库中的 _id
  username: string;
  role: 'admin' | 'family';
  name?: string;
  phone?: string;
  token?: string; // 登录成功后返回的 token
}

// 定义健康数据类型
export interface HealthData {
  heartRate: number;
  bloodOxygen: number;
  bodyTemperature: number;
  bloodPressure: string;
  sleepQuality: number;
  respiratoryRate: number;
  bloodSugar: number;
  fallDetected: boolean;
  medicationAdherence: number;
}

// 定义健康趋势数据类型
export interface HealthTrendData {
  heartRate: number[];
  bloodOxygen: number[];
  bodyTemperature: number[];
  bloodPressure: string[];
  timestamps: string[];
}

// 定义位置数据类型
export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  status: 'safe' | 'unsafe';
}

// 定义电子围栏数据类型
export interface GeofenceData {
  _id: number; // 适配数据库中的 _id
  elderlyId: number;
  name: string;
  centerLat: number;
  centerLng: number;
  radius: number;
  address: string;
}

// 定义位置历史数据类型
export interface LocationHistoryData {
  _id: number; // 适配数据库中的 _id
  elderlyId: number;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  status: 'safe' | 'unsafe';
}