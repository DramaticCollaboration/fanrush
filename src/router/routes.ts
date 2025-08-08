import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/login' },
      { path: 'dashboard', component: () => import('pages/Dashboard.vue') },
      { path: 'idea/new', component: () => import('pages/IdeaInput.vue') },
      { path: 'idea/:id/name-logo', component: () => import('pages/NameLogoSuggestion.vue') },
      { path: 'idea/:id/spec', component: () => import('pages/SpecEditor.vue') },
      { path: 'idea/:id/screens', component: () => import('pages/ScreenList.vue') },
      { path: 'idea/:id/code', component: () => import('pages/WebIDE.vue') },
      { path: 'idea/:id/build', component: () => import('pages/BuildStatus.vue') },
      { path: 'project/:id', component: () => import('pages/Project.vue') },
      { path: 'login', component: () => import('pages/Login.vue') },
      { path: 'community', component: () => import('pages/CommunityFeed.vue') },
      { path: 'settings', component: () => import('pages/ProfileSettings.vue') },
      { path: 'admin', component: () => import('pages/AdminDashboard.vue'), meta: { requiresAdmin: true } }
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
