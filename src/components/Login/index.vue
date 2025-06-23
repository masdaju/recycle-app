<template>
  <div class="form-container background-container">
    <!-- 注册表单 -->
    <el-form ref="form" size="large" autocomplete="off" v-if="isRegister" :model="registerData" :rules="rules" class="translucent-form">
      <el-form-item>
        <h1>注册</h1>
      </el-form-item>

      <el-form-item prop="account">
        <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="registerData.account"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input :prefix-icon="Lock" type="password" placeholder="请输入密码" v-model="registerData.password" :show-password="true"></el-input>
      </el-form-item>
      <el-form-item prop="rePassword">
        <el-input :prefix-icon="Lock" type="password" placeholder="请再次输入密码" v-model="registerData.rePassword" :show-password="true"></el-input>
      </el-form-item>
      <el-form-item prop="name">
        <el-input :prefix-icon="User" placeholder="请输入姓名" v-model="registerData.name"></el-input>
      </el-form-item>
      <el-form-item prop="mobile">
        <el-input :prefix-icon="Phone" placeholder="请输入电话号码" v-model="registerData.mobile"></el-input>
      </el-form-item>
      <el-form-item prop="email">
        <el-input :prefix-icon="Message" placeholder="请输入邮箱" v-model="registerData.email"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button class="button" type="primary" auto-insert-space @click="register">
          注册
        </el-button>
      </el-form-item>

      <el-form-item class="flex">
        <el-link type="info" :underline="false" @click="isRegister = false; clearRegisterData()">
          ← 返回
        </el-link>
      </el-form-item>
    </el-form>

    <!-- 登录表单 -->
    <el-form ref="form" size="large" autocomplete="off" v-else :model="formData" :rules="rules" class="translucent-form">
      <el-form-item>
        <h1>登录</h1>
      </el-form-item>
      <el-form-item prop="account">
        <el-input placeholder="请输入用户名" v-model="formData.account"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input name="password" :prefix-icon="Lock" type="password" placeholder="请输入密码" v-model="formData.password"
                  :show-password="true"></el-input>
      </el-form-item>
      <el-form-item class="flex">
        <div class="flex">
          <el-checkbox>记住我</el-checkbox>
          <el-link type="primary" :underline="false">忘记密码？</el-link>
        </div>
      </el-form-item>
      <!-- 登录按钮 -->
      <el-form-item>
        <el-button class="button" type="primary" auto-insert-space :disabled="!(formData.account&&formData.password)"  @click="submitForm">登录</el-button>
      </el-form-item>
      <el-form-item class="flex">
        <el-link type="info" :underline="false" @click="isRegister = true; clearRegisterData()">
          去注册 →
        </el-link>
      </el-form-item>
    </el-form>
  </div>
</template>
<script setup>
import {ref,onMounted} from 'vue'
import { ElMessage} from 'element-plus';
import {
  User,Message,Phone,Lock
} from '@element-plus/icons-vue'
import {login,addUserService} from '@/api/user.js';

import { useRouter } from 'vue-router'
import useUserInfoStore from '@/stores/userInfo.js'
const userInfoStore = useUserInfoStore();
const isRegister = ref(false)
const router = useRouter()

const registerData = ref({
  account: '',
  password: '',
  rePassword: '',
  name: '',      // 姓名
  mobile: '',    // 电话号码
  email: ''      // 邮箱
})

const formData = ref({
  account:'',
  password: ''
})
const clearRegisterData = () => {
  registerData.value = {}
}

const checkRePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次确认密码'))
  } else if (value !== registerData.value.password) {
    callback(new Error('请确保两次输入的密码一样'))
  } else {
    callback()
  }
};
const rules = {
  account: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, max: 16, message: '长度为5~16位非空字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  rePassword: [
    { validator: checkRePassword, trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  mobile: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^[1][3-9][0-9]{9}$/, message: '请输入有效的电话号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

import { useTokenStore } from '@/stores/token.js'
const tokenStore = useTokenStore()
const submitForm = async () => {
  let result = await login(formData.value)
  ElMessage.success(result.data.code === 200 ? result.data.data : '登录成功')
  tokenStore.setToken(result.data.saTokenInfo.tokenValue)
  userInfoStore.setInfo(result.data)

  // console.log()
  router.push('/home')
}
const register = async () => {
  // 表单验证

  console.log(registerData.value)
  // 调用 addUserService 接口来注册用户
  const result = await addUserService(registerData.value);

  if (result.code === 200) {
    ElMessage.success('注册成功');
    isRegister.value = false;  // 注册成功后切换到登录界面
    clearRegisterData();       // 清空注册数据
  } else {
    ElMessage.error(result.msg || '注册失败');
  }
}

onMounted(() => {

  if (tokenStore.token){
    router.push('/home')
  }
})
</script>

<style lang="scss" scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.translucent-form {
  /* 设置透明度，取值范围 0（完全透明）到 1（完全不透明），这里设置为 0.8 即 80% 不透明 */
  opacity: 0.9;
  background-color: white; /* 可以根据需要设置表单的背景颜色 */
  padding: 20px; /* 添加一些内边距，让表单内容更美观 */
  border-radius: 10px; /* 添加圆角 */
}
.background-container {
  /* 设置背景图片的路径 */
  background-image: url('@/assets/background.png');
  /* 让背景图片覆盖整个容器 */
  background-size: cover;
  /* 背景图片居中显示 */
  background-position: center;
  /* 防止背景图片重复 */
  background-repeat: no-repeat;
  /* 设置容器的最小高度，确保背景图片有足够的空间显示 */
  min-height: 100vh;
}
:deep(.el-form) {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h3 {
  font-size: 1.5rem;
  color: #333;
  text-align: center;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2rem;
  color: #333;
  text-align: center;
  margin-bottom: 1.5rem;
}

:deep(.el-input) {
  .el-input__wrapper {
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  }
}

.flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

:deep(.el-checkbox) {
  margin-right: 0;
}

:deep(.el-button) {
  width: 100%;
  border-radius: 0.5rem;
  height: 2.5rem;
  font-size: 1rem;
  font-weight: 600;
}
</style>