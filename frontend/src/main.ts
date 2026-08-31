import { createApp } from 'vue';
import App from './App.vue';
import './assets/style.css';
import PiniaConfig from './PiniaConfig.js';
import router from './router/index.js';

const app = createApp(App);

app.use(PiniaConfig.init());
app.use(router);
app.mount('#app');