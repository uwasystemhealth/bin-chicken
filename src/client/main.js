import Vue from 'vue';
import './vuikit';
import App from './App.vue';
import router from './router';
import users from './users';
import './configs';

Vue.config.productionTip = false;

users.login().catch(console.error).then(() => { // eslint-disable-line no-console
  new Vue({ // eslint-disable-line no-new
    router,
    template: '<App/>',
    components: { App },
  }).$mount('#app');
});
