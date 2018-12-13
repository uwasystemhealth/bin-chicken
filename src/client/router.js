import Vue from 'vue';
import Router from 'vue-router';

import users from './users';

import login from './components/login.vue';
import usersComp from './components/users.vue';
import configs from './components/configs.vue';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'Configs',
      component: configs,
    },
    {
      path: '/users',
      name: 'Users',
      component: usersComp,
    },
    {
      path: '/login/',
      name: 'Login',
      component: login,
      meta: { isPublic: true },
    },
    {
      path: '/logout/',
      name: 'Logout',
      component: login,
      meta: { isPublic: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const isPublic = to.matched.some(record => !!record.meta.isPublic);
  if (to.path === '/logout') {
    // eslint-disable-next-line no-console
    return users.logout().then(() => next({ path: '/login' })).catch(console.error);
  }
  if (isPublic && users.loggedIn) {
    return next({ path: '/' });
  } else if (!isPublic && !users.loggedIn) {
    return next({
      path: '/login',
      query: to.path === '/' ? {} : { followPath: to.path },
    });
  }
  return next();
});

export default router;
