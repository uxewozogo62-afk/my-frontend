<template>
  <div class="register-container">
    <div class="register-form">
      <h2 class="register-title">智能养老监护系统 - 注册</h2>
      
      <a-radio-group v-model:value="registerType" class="register-type-group">
        <a-radio value="family">家属注册</a-radio>
        <a-radio value="admin">管理员注册</a-radio>
      </a-radio-group>
      
      <a-form :model="form" layout="vertical" class="form-container">
        <a-form-item label="用户名">
          <a-input v-model:value="form.username" placeholder="请输入用户名" />
        </a-form-item>
        
        <a-form-item label="密码">
          <a-input-password v-model:value="form.password" placeholder="请输入密码" />
        </a-form-item>
        
        <a-form-item label="确认密码">
          <a-input-password v-model:value="form.confirmPassword" placeholder="请确认密码" />
        </a-form-item>
        
        <a-form-item label="姓名">
          <a-input v-model:value="form.name" placeholder="请输入姓名" />
        </a-form-item>
        
        <a-form-item label="联系方式">
          <a-input v-model:value="form.phone" placeholder="请输入手机号" />
        </a-form-item>
        
        <a-form-item>
          <a-button type="primary" block @click="handleRegister" class="register-button">
            注册
          </a-button>
        </a-form-item>
      </a-form>
      
      <div class="register-tips">
        <p>已有账号？<a href="/" @click.prevent="router.push('/')">点击登录</a></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { authApi } from '../api/index' // 1. 引入 API

const router = useRouter()
const registerType = ref('family')
const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: ''
})

const handleRegister = async () => { // 2. 改成 async 函数
  // 表单验证
  if (!form.value.username || !form.value.password || !form.value.name || !form.value.phone) {
    message.error('请填写完整的注册信息')
    return
  }
  if (form.value.password !== form.value.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  
  try {
    // 3. 发起真实后端请求
    const res = await authApi.register({
      username: form.value.username,
      password: form.value.password,
      name: form.value.name,
      phone: form.value.phone,
      role: registerType.value
    });

    // 根据后端返回判断
    message.success('注册成功！数据已存入数据库');
    
    setTimeout(() => {
      router.push('/'); // 返回登录页
    }, 1500);
    
  } catch (error: any) {
    console.error('注册失败:', error);
    const errorMsg = error.response?.data?.message || '注册请求失败，请检查后端服务';
    message.error(errorMsg);
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.register-form {
  width: 400px;
  padding: 32px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.register-title {
  text-align: center;
  margin-bottom: 24px;
  color: #1890ff;
  font-size: 24px;
  font-weight: bold;
}

.register-type-group {
  margin-bottom: 24px;
  text-align: center;
}

.form-container {
  margin-bottom: 16px;
}

.register-button {
  height: 48px;
  font-size: 16px;
}

.register-tips {
  text-align: center;
  font-size: 14px;
  margin-top: 16px;
}

.register-tips a {
  color: #1890ff;
  text-decoration: none;
}

.register-tips a:hover {
  text-decoration: underline;
}

/* 适老化设计 */
@media (max-width: 768px) {
  .register-form {
    width: 90%;
    padding: 24px;
  }
  
  .register-title {
    font-size: 20px;
  }
  
  .register-button {
    height: 56px;
    font-size: 18px;
  }
  
  .register-type-group {
    font-size: 16px;
  }
}
</style>