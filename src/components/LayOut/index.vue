<template>
    <div class="layout-body">
        <div class="layout-aside" :style="{height : bodyH + 'px'}">
            <el-menu
                style="height: 100%;"
                :default-active="defaultActive"
                class="el-menu-vertical-demo"
                router
                :collapse="isCollapse"
                :default-openeds="['/system', '/operation']"
            >

              <el-sub-menu index="/dashboard" >
                <template #title>
                  <el-icon><IconMenu /></el-icon>
                  <span>视图</span>
                </template>
                <el-menu-item index="/dash" :disabled="!userInfoStore.info.resource.includes('Console')">控制台</el-menu-item>
              </el-sub-menu>

              <el-sub-menu index="/system" >
                <template #title>
                  <el-icon><IconMenu /></el-icon>
                  <span>系统管理</span>
                </template>
                <el-menu-item index="/system/resources" :disabled="!userInfoStore.info.resource.includes('resourceManage')" >资源管理</el-menu-item>
                <el-menu-item index="/system/role" :disabled="!userInfoStore.info.resource.includes('roleManage')">角色管理</el-menu-item>
                <el-menu-item index="/system/user" :disabled="!userInfoStore.info.resource.includes('userManage')">用户管理</el-menu-item>
              </el-sub-menu>


              <el-sub-menu index="/operation">
                <template #title>
                  <el-icon><IconMenu /></el-icon>
                  <span>业务管理</span>
                </template>
                <el-menu-item index="/feedBack" :disabled="!userInfoStore.info.resource.includes('feedback')">用户回收反馈</el-menu-item>
                <el-menu-item index="/report" :disabled="!userInfoStore.info.resource.includes('report')">废品回收</el-menu-item>
                <el-menu-item index="/request" :disabled="!userInfoStore.info.resource.includes('requestManage')">申请管理</el-menu-item>
                <el-menu-item index="/schedule" :disabled="!userInfoStore.info.resource.includes('scheduleManage')">调度管理</el-menu-item>
                <el-menu-item index="/vehicle" :disabled="!userInfoStore.info.resource.includes('carManage')">车辆管理</el-menu-item>
                <el-menu-item index="/waste" :disabled="!userInfoStore.info.resource.includes('wasteManage')">废品管理</el-menu-item>
                <el-menu-item index="/statistic" :disabled="!userInfoStore.info.resource.includes('statistic')">统计</el-menu-item>
              </el-sub-menu>



            </el-menu>

        </div>
        <div class="layout-content">
            <div class="topbar">
                <div class="collapse">

                    <div style="cursor: pointer;" v-if="isCollapse" @click="isCollapse = !isCollapse"><el-icon><Expand /></el-icon></div>
                    <div style="cursor: pointer;" v-else @click="isCollapse = !isCollapse"><el-icon><Fold /></el-icon></div>
                </div>
              <div class="avatar">
                <el-avatar
                    :src="userInfoStore.info.avatarUrl || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'"
                />
              </div>

                <el-dropdown trigger="click">


                    <span class="el-dropdown-link" style="cursor: pointer;">
                       {{ userInfoStore.info.name}}
                        <el-icon class="el-icon--right">
                            <arrow-down />
                        </el-icon>
                    </span>
                    <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="router.push('/userInfo')">个人中心</el-dropdown-item>
                      <el-dropdown-item @click="router.push('/home')">前台</el-dropdown-item>
                      <el-dropdown-item @click="handleLogout">登出系统</el-dropdown-item>
                    </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <div class="main">
                <router-view />
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import {
    Menu as IconMenu,
    ArrowDown,
    Fold,
    Expand
    } from '@element-plus/icons-vue';
    import { ElMessage} from 'element-plus';
    import {logout} from '@/api/user.js';

    import { useRouter } from 'vue-router'

    const router = useRouter()

    const isCollapse = ref(false)

    const defaultActive = ref('/statistic')

    const bodyH = document.documentElement.clientHeight;

    import useUserInfoStore from '@/stores/userInfo.js'
    import {useTokenStore} from "@/stores/token.js";

    const userInfoStore = useUserInfoStore()
    const tokenStore = useTokenStore()
    const handleLogout = async () => {
      console.log(userInfoStore.info.id)
          let result = await logout(userInfoStore.info.id);
      ElMessage.success(result.code===200 ? result.msg : '退出成功')
      userInfoStore.removeInfo()//清除用户信息
      tokenStore.removeToken()//清除token信息
      router.push('/')
    }
    console.log(userInfoStore.info)
if (userInfoStore.info.role === 'user'){
  router.push('/home')
}
</script>

<style lang="scss" scoped>
.avatar{
  display: flex;
  margin-left: auto;
}
.layout-body {
    overflow: hidden;
    display: flex;
    .layout-aside {
        .el-menu-vertical-demo:not(.el-menu--collapse) {
            width: 290px;
        }
    }

    .layout-content {
        width: 100%;
        .topbar {
            height: 68px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px 0 24px;
            box-shadow: 10px 0 10px #eee;
            .example-showcase .el-dropdown-link {
                cursor: pointer;
                color: var(--el-color-primary);
                display: flex;
                align-items: center;
            }
        }
    }
}


</style>