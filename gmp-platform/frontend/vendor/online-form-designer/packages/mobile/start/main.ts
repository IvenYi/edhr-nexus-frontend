import './assets/main.less';
import 'vant/es/toast/style';
import 'vant/es/dialog/style';
import 'vant/es/notify/style';
import 'vant/es/image-preview/style';
import 'uno.css';
import { createApp } from 'vue';
import '@vant/touch-emulator';
import App from './App.vue';
import router from './router';
// import VConsole from 'vconsole';

const app = createApp(App);

// new VConsole({ theme: 'dark' });
app.use(router);
app.mount('#app');
