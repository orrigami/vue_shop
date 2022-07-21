import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue';
import Home from '../components/Home.vue';

Vue.use(VueRouter)

const routes = [

]

const router = new VueRouter({
  routes: [{
      path: '/',
      redirect: 'Login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/Home',
      component: Home
    },
  ]
})

// 挂载路由守卫
// to:将要访问路径  from:从哪个路径来   next:要去哪个路径
// next()放行   next('/login')强制跳转
router.beforeEach((to, from, next) => {
  if (to.path === "/login") return next();
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login');
  next()
})

export default router