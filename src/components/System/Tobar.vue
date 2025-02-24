<template>
  <div class="page-container">
    <!-- 横向导航栏 -->
    <el-menu
        class="horizontal-menu"
        mode="horizontal"
        :default-active="activeIndex"
        background-color="#409EFF"
        text-color="#fff"
        active-text-color="#FFD04B"
        @select="handleSelect"
    >
      <el-menu-item index="1" :disabled="!userInfoStore.info.resource.includes('homepage')">
        <el-icon><House/></el-icon>
        首页</el-menu-item>
      <el-menu-item index="7" :disabled="!userInfoStore.info.resource.includes('addRequest')">
        <el-icon><User /></el-icon>
        申请页面</el-menu-item>
      <el-menu-item index="2" :disabled="!userInfoStore.info.resource.includes('userInfo')">
        <el-icon><User /></el-icon>
        个人信息</el-menu-item>
      <el-menu-item index="3" :disabled="!userInfoStore.info.resource.includes('chat')" >
        <el-icon><Message/></el-icon>
        聊天</el-menu-item>
      <el-menu-item index="4" :disabled="!userInfoStore.info.resource.includes('SysMessage')">
          <el-icon><Message/></el-icon>
        系统消息</el-menu-item>
      <el-menu-item index="5" :disabled="!userInfoStore.info.resource.includes('myRequest')">
        <el-icon><position/></el-icon>
        我的申请</el-menu-item>
      <el-menu-item index="6" v-if="userInfoStore.info.roleValue!=='user'">
        <el-icon><setting/></el-icon>
        后台</el-menu-item>
    </el-menu>

    <!-- 主体内容 -->
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
import {Message, User, House, Position, Setting} from "@element-plus/icons-vue";
// 当前选中的导航索引
import useUserInfoStore from "@/stores/userInfo.js";
const userInfoStore = useUserInfoStore();
console.log(userInfoStore.info)
const activeIndex = ref("1");
// 路由实例

// 处理导航栏选中事件
const handleSelect = (index) => {
  switch (index) {
    case "1":
      router.push("/home"); // 跳转到首页内容
      break;
    case "7":
      router.push("/addRequest"); // 跳转到登录页面
      break;
    case "2":
      router.push("/userInfo");
      break;
    case "3":
      router.push("/Chat");
      break;
    case "4":
      router.push("/MyMsg");
      break;
    case "5":
      router.push("/myRequest"); // 跳转到联系我们内容
      break;
    case "6":
      router.push("/admin"); // 跳转到后台页面，整个页面加载
      break;
    default:
      router.push("/home");
  }
};
</script>

<style scoped>
/* 页面整体样式 */
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f2f5;
}

/* 横向导航栏样式 */
.horizontal-menu {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #409eff;
  border-bottom: 2px solid #ddd;
  font-size: 1.1rem;
}

/* 主体内容样式 */

</style>
