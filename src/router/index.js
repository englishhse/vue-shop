import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from 'views/Login.vue'

import '../assets/fonts/iconfont.css'



Vue.use(VueRouter)
import welcome from '../views/homeChild/WelCome.vue'

const user = () => import ('../views/user/User.vue')
const routes = [
  {
    path: '/' ,
    redirect:'/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: () => import('views/Home.vue'),
    redirect:'/welcome',
    children:[
      {
        path:'/welcome',
        component: welcome
      },
      {
        path:'/users',
        component: user
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to,from,next)=>{
  if(to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if(!token) return next('/login')
  next()
})



export default router
