import Vue from 'vue';
import VueRouter from 'vue-router';
import { BootstrapVue } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import App from './App.vue';
import recent from './pages/recent.vue';
import spectrogram from './pages/spectrogram.vue';

Vue.config.productionTip = false;
Vue.use(BootstrapVue);
Vue.use(VueRouter);

const routes = [
  { path: '/recent', component: recent },
  { path: '/spectrogram', component: spectrogram },
];

const router = new VueRouter({
  mode: 'history',
  routes, // short for `routes: routes`
});

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
