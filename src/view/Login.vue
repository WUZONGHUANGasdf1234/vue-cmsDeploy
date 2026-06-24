<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="title">CMS 管理系统</h2>

      <form @submit.prevent="handleSubmit">
        <div class="form-item">
          <label>用户名</label>
          <input v-model="form.username" type="text" placeholder="请输入用户名" />
        </div>

        <div class="form-item">
          <label>密码</label>
          <input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
          />
        </div>

        <button class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { login } from '@/http/login.ts'
import router from '@/router/index'
import { useUserStore } from '@/stores/user.ts'
import { registerDynamicRoutes } from '@/router'

const form = ref({
  username: 'liwei',
  password: 'lw1234'
})

const loading = ref(false)

const handleSubmit = async () => {
  if (!form.value.username || !form.value.password) {
    alert('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    const data: any = await login(form.value)
    console.log('后端返回的数据：', data)

    if (data.code === 200) {
      const userStore = useUserStore()
      userStore.setToken(data.data.token)
      userStore.setUserInfo(data.data)

      registerDynamicRoutes(data.data.menuTree || [])
      router.push('/dashboard')
    } else {
      alert('登录失败')
    }
  } catch (err) {
    console.error(err)
    alert('请求失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f7fa;
}

.login-form {
  width: 360px;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.form-item {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.login-btn {
  width: 100%;
  padding: 10px;
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>