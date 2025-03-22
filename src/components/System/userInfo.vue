<template>
  <div class="user-info-page">
    <el-card class="user-info-card">
      <div class="user-info-header">
        <el-dropdown trigger="click"> <!-- 设置触发方式为点击 -->
          <span class="el-dropdown-link">
            <el-avatar
                :src="userInfoStore.info.avatarUrl || defaultAvatar"
                size="large"
            />
            <h2>{{ userInfoStore.info.name || '未知用户' }}</h2>
            <h2>   {{ "金额："+userInfoStore.info.amount }}</h2>
          </span>

          <template #dropdown>
            <!-- 在这里添加下拉菜单的具体选项内容 -->
            <el-dropdown-menu>
              <el-dropdown-item @click="passwordDialogVisible=true">修改密码</el-dropdown-item>
              <el-dropdown-item @click="userInfoDialogVisible=true">修改个人信息</el-dropdown-item>
              <el-dropdown-item @click="handleLogout">登出系统</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <el-divider>基本信息</el-divider>
      <el-descriptions border column="2">
        <el-descriptions-item label="账号">
          {{ userInfoStore.info.account || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ userInfoStore.info.name || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ userInfoStore.info.mobile || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ userInfoStore.info.email || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="角色">
          {{ userInfoStore.info.roleName || '未分配角色' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ "你于"+formatDate(userInfoStore.info.createTime)+"注册了该账号" || '无'  }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider>其他信息</el-divider>
      <el-descriptions border column="2">

        <el-descriptions-item label="登录平台">
          {{ userInfoStore.info.saTokenInfo.loginDevice || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="登录类型">
          {{ userInfoStore.info.saTokenInfo.loginType || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="生涯">
          {{ "您一共在平台回收了总价值为"+userInfoStore.info.amount+"员的废品" || '无' }}
        </el-descriptions-item>
      </el-descriptions>
      <el-divider>修改头像</el-divider>
      <el-upload
          action="#"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-change="handleFileChange"
          :limit="1"
          :auto-upload="false"
          accept=".png,.jpg,.jpeg"
      >
        <el-icon><Plus /></el-icon>
      </el-upload>
      <el-button type="primary" @click="uploadAvatar">上传</el-button>
    </el-card>
    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image" style="height: 500px; width: auto"/>
    </el-dialog>
  </div>
  <el-dialog title="修改密码" v-model="passwordDialogVisible">
    <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input type="password" v-model="passwordForm.oldPassword" placeholder="请输入旧密码" />
      </el-form-item>

      <el-form-item label="新密码" prop="newPassword">
        <el-input type="password" v-model="passwordForm.newPassword" placeholder="请输入新密码" />
      </el-form-item>

      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input type="password" v-model="passwordForm.confirmPassword" placeholder="请确认新密码" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="updatePassword">提交</el-button>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <el-dialog title="修改个人信息" v-model="userInfoDialogVisible">
    <el-form :model="userInfoForm" :rules="userInfoRules" ref="userInfoFormRef" label-width="100px">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="userInfoForm.name" placeholder="请输入姓名" />
      </el-form-item>

      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="userInfoForm.mobile" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="userInfoForm.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="updateUserInfo">提交</el-button>
        <el-button @click="userInfoDialogVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

</template>

<script setup>
import { ref } from "vue";
import { Plus} from "@element-plus/icons-vue";
import {logout, uploadAvatarService,updatePasswordService,updateUserService} from "@/api/user.js";
import {formatDate} from "@/utils/day.js";
import { useRouter } from 'vue-router'
import {ElMessage} from "element-plus";
import {useTokenStore} from "@/stores/token.js";
import {fetchAmount} from "@/api/user.js";

const tokenStore = useTokenStore()
import useUserInfoStore from "@/stores/userInfo.js";
const userInfoStore = useUserInfoStore();


const passwordDialogVisible = ref(false);
const passwordFormRef = ref(null);  // Declare the passwordFormRef here
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const passwordRules = {
  oldPassword: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
  newPassword: [{ required: true, message: "请输入新密码", trigger: "blur" }],
  confirmPassword: [{ required: true, message: "请确认新密码", trigger: "blur" }],
};

const updatePassword = async () => {
  // Validate the form

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error("新密码和确认密码不一致");
    return;
  }

  try {
    const response = await updatePasswordService({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
    });

    if (response.code === 200) {
      ElMessage.success("密码修改成功");
      passwordDialogVisible.value = false;
      await handleLogout()
    } else {
      ElMessage.error(response.msg || '密码修改失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("密码修改失败");
  }
};
const userInfoDialogVisible = ref(false);
const userInfoForm = ref({
  name: '',
  mobile: '',
  email: '',
});

const userInfoRules = {
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  mobile: [{ required: true, message: "请输入手机号", trigger: "blur" }],
  email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
};

const updateUserInfo = async () => {
  // Validate the form

  try {
    const response = await updateUserService(userInfoForm.value);

    if (response.code === 200) {
      ElMessage.success("个人信息修改成功");
      userInfoDialogVisible.value = false;
      userInfoStore.info.name = userInfoForm.value.name;
      userInfoStore.info.mobile = userInfoForm.value.mobile;
      userInfoStore.info.email = userInfoForm.value.email;

    } else {
      ElMessage.error(response.msg || '个人信息修改失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("个人信息修改失败");
  }
};

console.log(userInfoStore.info)
const router = useRouter()
// 默认头像
const defaultAvatar = "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png";
const disabled = ref(false)
const uploadRef = ref();
const img= ref();
const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const amount = async () => {
  let res = await fetchAmount(userInfoStore.info.id)
  userInfoStore.info.amount = res.data
}
amount()
const handleRemove = (file) => {
  uploadRef.value?.remove(file);
}
const handlePictureCardPreview = (file) => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}
const handleFileChange = (uploadFile) => {
  console.log(uploadFile.raw)
  img.value = uploadFile.raw; // 获取原始文件
};
const handleLogout = async () => {
  console.log(userInfoStore.info.id)
  let result = await logout(userInfoStore.info.id);
  ElMessage.success(result.code===200 ? result.msg : '退出成功')
  userInfoStore.removeInfo()//清除用户信息
  tokenStore.removeToken()//清除token信息
  router.push('/')
}
const uploadAvatar = async () => {
  const formData = new FormData();
  formData.append("avatar", img.value)
 const res =await uploadAvatarService(formData)
  if (res.code === 200) {
    userInfoStore.info.avatarUrl = res.msg;
    ElMessage.success("头像修改成功")
  }
}

</script>

<style scoped>
.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 16px;
}
.el-dropdown-menu {
  min-width: 120px; /* 设置下拉菜单最小宽度，可根据实际情况调整 */
}
.avatar-uploader .avatar {
  width: 178px;
  height: 68px;
  display: block;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.user-info-page {
  height: 90vh; /* 页面高度占满屏幕 */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.user-info-card {
  width: 90%; /* 宽度占屏幕 90% */
  height: 80%; /* 高度占屏幕 90% */
  padding: 20px;
  overflow: auto; /* 若内容过多，显示滚动条 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.user-info-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.user-info-header h2 {
  margin: 0;
  font-size: 24px;
}
</style>
