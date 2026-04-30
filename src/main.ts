import './assets/main.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import FileUpload from './components/FileUpload.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: FileUpload }],
})

createApp(App).use(router).use(ui).mount('#app')
