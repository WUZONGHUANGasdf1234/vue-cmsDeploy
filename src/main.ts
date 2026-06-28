import { createApp } from 'vue'
import App from './App.vue'
// 1. 引入 createPinia
import { createPinia } from 'pinia'
// 2. 引入 router (假设你已经创建了 router 文件)
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import permissionDirective from '@/directives/permission'

// 3. 创建 Pinia 实例
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) // 注册插件

const app = createApp(App)

// 4. 【关键步骤】必须在 use(router) 之前 use(pinia)
app.use(pinia)
app.use(router)

app.mount('#app')
app.use(permissionDirective)