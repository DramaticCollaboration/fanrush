import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'dashboard', component: () => import('pages/IndexPage.vue') },
      { path: 'auth', name: 'auth', component: () => import('pages/AuthPage.vue') },
      { path: 'profile', name: 'profile', component: () => import('pages/RushProfilePage.vue') },
      { path: 'confirm', name: 'confirm', component: () => import('pages/BookingConfirmPage.vue') },
      { path: 'success', name: 'success', component: () => import('pages/BookingSuccessPage.vue') },
      { path: 'mypage', name: 'mypage', component: () => import('pages/MyPage.vue') },
      { path: 'notifications', name: 'notifications', component: () => import('pages/NotificationsPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
