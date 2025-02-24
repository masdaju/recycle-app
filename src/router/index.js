import {createWebHistory, createRouter, createWebHashHistory} from 'vue-router'

import LayOut from '@/components/LayOut/index.vue'
import Login from '@/components/Login/index.vue'
import Resources from '@/components/Resources/index.vue'
import User from '@/components/User/index.vue'
import Role from '@/components/Role/index.vue'
import userInfo from "@/components/System/userInfo.vue";
import dashboard from  "@/components/Dashboard/dashboard.vue";
import Tobar from "@/components/System/Tobar.vue";
import Home from "@/components/System/Home.vue";
import MyRequest from "@/components/System/MyRequest.vue";
import MyMsg from "@/components/System/MyMsg.vue";
import Feedback from "@/components/dashboard/Feedback.vue";
import Reports from "@/components/dashboard/Reports.vue";
import Request from "@/components/dashboard/Request.vue";
import Statistic from "@/components/dashboard/Statistic.vue";
import Vehicle from "@/components/dashboard/Vehicle.vue";
import Waste from "@/components/dashboard/Waste.vue";
import Schedule from "@/components/dashboard/Schedule.vue";
import Chat from "@/components/System/Chat.vue";
import AddRequest from "@/components/System/AddRequest.vue";
const routes = [{
  path: '/',
  redirect: '/login'
},{
  path: '/login',
  component: Login
},
  {
    path: '/home',
    component: Tobar,
    children: [
        {path: '/addRequest', component: AddRequest},
        {path: '/home', component: Home},
      { path: '/MyMsg', component: MyMsg },
      { path: '/Chat', component: Chat },
        {path: '/myRequest', component: MyRequest},
      {path: '/userInfo', component: userInfo}



    ]
  },
  {
    path: '/admin',
    component: LayOut,
    redirect: '/statistic',
    children: [
      {path: '/report',component: Reports},
      {path:'/request',component: Request},
      {path: '/schedule',component: Schedule},
      {path: '/statistic',component: Statistic},
      {path: '/vehicle',component: Vehicle},
      {path: '/waste',component: Waste},
      { path: '/dash', component: dashboard },
      {path: '/feedBack',component: Feedback},
      { path: '/system/resources', component: Resources },
      { path: '/system/user', component: User },
      { path: '/system/role', component: Role }

    ]
  }]

const router = createRouter({
  // mode: 'history', // 'history',
  // history:createWebHistory(),
  //使用hash模式
  history: createWebHashHistory(), // createWebHistory(),
  routes:routes,
})

export default router;