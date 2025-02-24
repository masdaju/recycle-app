// import './assets/main.css'

import { createPersistedState } from 'pinia-plugin-persistedstate'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import router from '@/router/index'
import App from './App.vue'
import {createPinia} from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import locale from 'element-plus/dist/locale/zh-cn'

const app = createApp(App)
const persist = createPersistedState();
const pinia = createPinia()
pinia.use(persist)
app.use(pinia)
app.use(ElementPlus,{locale})
app.use(router)
app.mount('#app')


