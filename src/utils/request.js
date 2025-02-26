
import axios from 'axios';

import { ElMessage } from 'element-plus'

const baseURL = '/api';
const instance = axios.create({ baseURL })
import {useTokenStore} from '@/stores/token.js'
//添加请求拦截器
//1.添加token
instance.interceptors.request.use(
    (config)=>{
      //请求前的回调
      //添加token
      const tokenStore = useTokenStore();
      //判断有没有token
      if(tokenStore.token){
          //添加token到请求中
        // config.headers.Authorization = tokenStore.token
        config.headers['satoken'] = tokenStore.token;
        console.log(config.headers)
      }
      return config;
    },
    (err)=>{
      //请求错误的回调
      Promise.reject(err)
    }
)

/* import {useRouter} from 'vue-router'
const router = useRouter(); */

import router from '@/router'
//添加响应拦截器
instance.interceptors.response.use(
    result => {
      //判断业务状态码
      if(result.data.code===200){
          console.log(result.data)
        return result.data;
      }
      //操作失败
      //alert(result.data.msg?result.data.msg:'服务异常')
      ElMessage.error(result.data.msg?result.data.msg:'服务异常')
      //异步操作的状态转换为失败
      return Promise.reject(result.data)

//   if(result.data.code===200){
    },
    err => {
        // 如果后端HttpServletResponse返回了401,则跳转到登录页面
        switch (err.response.status) {
            case 401:
                //跳转到登录页面并且清除token
          const tokenStore = useTokenStore();
          tokenStore.removeToken();
          router.push('/')
                ElMessage.error('异常登录')
          break;
          case 429:
              ElMessage.error('服务繁忙')
          break;
          case 404:
              ElMessage.error('找不到该资源')
          break;
          case 500:
              ElMessage.error('服务器内部异常')
          //跳转到500页面
          break;
          default:ElMessage.error('服务异常')
          //其他情况
        }

      // if(err.response.status===401){
      //   ElMessage.error(err.response.data.msg?err.response.data.msg:'请先登录')
      //     //清除token
      //     const tokenStore = useTokenStore();
      //     tokenStore.removeToken();
      //     //跳转到登录页面
      //     router.push('/')
      // }else{
      //   ElMessage.error('服务异常')
      // }
      return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;
