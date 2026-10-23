import {createApp} from 'vue';
import {createPinia} from 'pinia';
import ElementPlus from 'element-plus';
import en from 'element-plus/es/locale/lang/en';
import 'element-plus/dist/index.css';
import App from './App.vue';
import {router} from './router';
import './styles.css';

createApp(App).use(createPinia()).use(router).use(ElementPlus, {locale: en}).mount('#app');
