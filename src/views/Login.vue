<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="login-title">智能养老监护系统</h2>
      
      <a-radio-group v-model:value="loginType" class="login-type-group">
        <a-radio value="family">家属登录</a-radio>
        <a-radio value="admin">管理员登录</a-radio>
      </a-radio-group>
      
      <a-form :model="form" layout="vertical" class="form-container">
        <a-form-item label="用户名">
          <a-input v-model:value="form.username" placeholder="请输入用户名" />
        </a-form-item>
        
        <a-form-item label="密码">
          <a-input-password v-model:value="form.password" placeholder="请输入密码" />
        </a-form-item>
        
        <a-form-item>
          <a-button type="primary" block @click="handleLogin" class="login-button">
            登录
          </a-button>
        </a-form-item>
      </a-form>
      
      <div class="login-tips">
        <p class="register-link">新用户？<a href="/register" @click.prevent="router.push('/register')">点击注册</a></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { authApi } from '../api/index'

const router = useRouter()
const loginType = ref('family')
const form = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    message.warning('请输入用户名和密码');
    return;
  }

  try {
    const { user, token } = await authApi.login({
      username: form.value.username,
      password: form.value.password,
      role: loginType.value
    });
    
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', loginType.value);
      if (user) {
        localStorage.setItem('userInfo', JSON.stringify(user));
      }
      
      message.success('登录成功，正在跳转...');
      
      setTimeout(() => {
        if (loginType.value === 'family') {
          router.push('/family/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
      }, 800);
    }

  } catch (error: any) {
    console.error('登录过程出错:', error);
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  width: 400px;
  padding: 32px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 24px;
  color: #1890ff;
  font-size: 24px;
  font-weight: bold;
}

.login-type-group {
  margin-bottom: 24px;
  text-align: center;
}

.form-container {
  margin-bottom: 16px;
}

.login-button {
  height: 48px;
  font-size: 16px;
}

.login-tips {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-top: 16px;
}

.register-link {
  margin-top: 8px;
}

.register-link a {
  color: #1890ff;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

/* 适老化设计 */
@media (max-width: 768px) {
  .login-form {
    width: 90%;
    padding: 24px;
  }
  
  .login-title {
    font-size: 20px;
  }
  
  .login-button {
    height: 56px;
    font-size: 18px;
  }
  
  .login-type-group {
    font-size: 16px;
  }
}
</style>
