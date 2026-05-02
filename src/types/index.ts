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
  _id?: number;              // 数据库主键
  elderly_id: number;        // 关联的老人ID[cite: 31]
  heartRate: number;         // 对应数据库 heartRate[cite: 31]
  bloodOxygen: number;       // 对应数据库 bloodOxygen[cite: 31]
  bodyTemperature: number;   // 对应数据库 bodyTemperature[cite: 31]
  bloodPressure: string;     // 对应数据库 bloodPressure[cite: 31]
  activitySteps: number;     // 对应数据库 activitySteps (替换掉之前的呼吸率等)[cite: 31]
  timestamp?: string;        // 对应数据库记录时间[cite: 31]
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
