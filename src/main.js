import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { plugin, defaultConfig } from '@formkit/vue'
import '@/assets/template/scss/styles.scss'
import '@/assets/template/js/scripts.js'
import '@formkit/themes/genesis'

createApp(App).use(plugin, defaultConfig).use(router).mount('#app')