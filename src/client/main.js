import Vue from 'vue';
import './vuikit';
import App from './App';
import router from './router';
import users from './users';
import './configs';

Vue.config.productionTip = false;
Vue.config.devtools = true;

users.login().catch(console.error).then(() => { // eslint-disable-line no-console
  new Vue({ // eslint-disable-line no-new
    router,
    components: { App },
    template: '<App/>',
  }).$mount('#app');
});
