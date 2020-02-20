import Vue from 'vue';
import Vuex from 'vuex';
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
Vue.use(Vuex);

const routes = [
  { path: '/recent', component: recent },
  { path: '/spectrogram', component: spectrogram },
];

// TODO static typing for record
const store = new Vuex.Store({
  state: {
    records: [] as any[],
    recordLength: 25,
  },
  getters: {
    lastEntries(state) {
      return state.records;
    },
  },
  mutations: {
    importNewData(state, record: any) {
      const docids = state.records.map(e => e.documentId);
      record.reverse().forEach((element: any) => {
        if (!docids.includes(element.documentId)) {
          state.records.push(element);
        }
      });
      while (state.records.length > state.recordLength) {
        state.records.shift();
      }
    },
  },
});

const router = new VueRouter({
  mode: 'history',
  routes, // short for `routes: routes`
});

new Vue({
  store,
  router,
  render: h => h(App),
}).$mount('#app');
