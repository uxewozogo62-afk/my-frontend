const fetchHealthData = async () => {
  try {
    const elderlyId = route.query.id as string || '1'; 
    const realtime = await healthApi.getRealtime(elderlyId);
    
    if (realtime) {
      // 指标更新
      healthMetrics.value.forEach(metric => {
        if (realtime[metric.key] !== undefined) {
          metric.value = realtime[metric.key];
          if (metric.key === 'heartRate') {
            metric.status = (metric.value > 100 || metric.value < 60) ? 'abnormal' : 'normal';
          }
        }
      });
      
      // 步数更新：校验 activitySteps 或 steps 字段[cite: 4]
      todaySteps.value = realtime.activitySteps !== undefined ? realtime.activitySteps : (realtime.steps || 0);
      
      // 更新图表：步数变化后重新绘制柱状图[cite: 4]
      if (activityChart) {
        initActivityChart(); 
      }

      hasWarning.value = healthMetrics.value.some(m => m.status === 'abnormal');
      if (realtime.timestamp) {
        lastUpdateTime.value = new Date(realtime.timestamp).toLocaleTimeString();
      }
    }
  } catch (error: any) {
    console.error('获取健康数据失败:', error);
  }
}
