import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'stores/auth'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });


  Router.beforeEach((to, from, next) => {
    const auth = useAuthStore()

    // 관리자 전용 페이지 체크
    if (to.meta.requiresAdmin && !auth.isAdmin) {
      next('/dashboard')
      return
    }

    // 로그인이 필요한 페이지 체크
    if (to.path !== '/login' && !auth.isAuthenticated) {
      next('/login')
      return
    }

    // 이미 로그인한 상태에서 로그인 페이지 접근 시
    if (to.path === '/login' && auth.isAuthenticated) {
      next('/dashboard')
      return
    }

    next()
  })


  return Router;
});
