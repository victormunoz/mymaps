
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {path: '/', component:() => import('pages/LoginPage.vue')},
      { path: '/Login', name: "Login", component: () => import('pages/LoginPage.vue') },
      { path: '/Entities', name: "Entities", component: () => import('pages/Entities.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
