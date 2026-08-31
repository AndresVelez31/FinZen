import { createApp } from 'vue';
import App from './App.vue';
import './assets/style.css';
import PiniaConfig from './PiniaConfig';
import router from './router';

const app = createApp(App);
app.use(PiniaConfig.init());
app.use(router);
app.mount('#app');