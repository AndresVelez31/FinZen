import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './assets/style.css';
import PiniaConfig from './PiniaConfig.js';

const router = createRouter({
  history: createWebHistory('/'),
  routes: [],
});

const app = createApp(App);
app.use(PiniaConfig.init());
app.use(router);
app.mount('#app');
