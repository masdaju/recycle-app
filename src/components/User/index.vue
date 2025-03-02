<template>
    <h1 class="page-title">用户列表</h1>
    <div class="table-header">
      <div class="search-container">
        <el-input
            v-model="searchQuery"
            placeholder="搜索用户名"
            class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch" :disabled="!userInfoStore.info.resource.includes('queryUser')">搜索</el-button>
      </div>
      <el-button type="primary" :disabled="!userInfoStore.info.resource.includes('addUser')" @click="showAddUserDialog">新增用户</el-button>
    </div>
    <el-table
        :data="users"
        v-loading="loading"
        :header-cell-style="{ background: '#f5f7fa' }"
        class="styled-table"
    >
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="name" label="姓名" width="150" />
      <el-table-column prop="account" label="账号" width="180" />
      <el-table-column prop="mobile" label="手机号" width="180" />
      <el-table-column prop="roleName" label="角色名称"  />
      <el-table-column prop="roleValue" label="角色值" min-width="200" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" :disabled="!userInfoStore.info.resource.includes('editUser')" @click="edite(scope.row)" class="action-button">编辑</el-button>
          <el-button size="small" type="danger" :disabled="!userInfoStore.info.resource.includes('delUser')" @click="deleteUser(scope.row.id)" class="action-button">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
          v-if="total > 0"
          v-model:currentPage="pageNum"
          v-model:pageSize="pageSize"
          :page-sizes="[3,5,10,15,20]"
          :small="false"
          :disabled="false"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="onSizeChange"
          @current-change="onCurrentChange"
          class="styled-pagination"
      />
    </div>

    <!-- Add User Dialog -->
    <el-dialog v-model="addUserDialogVisible" title="新增用户" width="30%" center>
      <el-form :model="newUser" label-width="100px">
        <el-form-item label="启用状态">
          <el-switch v-model="newUser.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="newUser.name" />
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="newUser.account" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="newUser.password" type="password" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="newUser.mobile" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="newUser.roleId" placeholder="请选择角色">
            <el-option
                v-for="role in roleList"
                :key="role.id"
                :label="role.name"
                :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addUserDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addUser">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Edit User Dialog -->
    <el-dialog v-model="editUserDialogVisible" title="编辑用户" width="30%" center>
      <el-form :model="currentUser" label-width="100px">
        <el-form-item label="启用状态">
          <el-switch v-model="currentUser.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="currentUser.name" />
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="currentUser.account" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="currentUser.roleId" placeholder="请选择角色">
            <el-option
                v-for="role in roleList"
                :key="role.id"
                :label="role.name"
                :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editUserDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateUser">确定</el-button>
        </span>
      </template>
    </el-dialog>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { updateUserService, deleteUserService, getUserListService,addUserService } from "@/api/user";
import { getRoleList } from "@/api/role.js";
import useUserInfoStore from "@/stores/userInfo.js";
const userInfoStore = useUserInfoStore()
const pageNum = ref(1);
const total = ref(0);
const pageSize = ref(3);
const loading = ref(false);
const users = ref([]);
const roleList = ref([]); // 角色列表
const searchQuery = ref('');
const addUserDialogVisible = ref(false);
const editUserDialogVisible = ref(false);
const newUser = ref({
  status: 0, // 默认启用
  account: '',
  password: '',
  name: '',
  mobile: '',
  roleId: null
});
const currentUser = ref({});

const onSizeChange = (size) => {
  pageSize.value = size;
  userList();
};

const onCurrentChange = (num) => {
  pageNum.value = num;
  userList();
};

const userList = async () => {
  loading.value = true;
  try {
    const params = {
      current: pageNum.value,
      pageSize: pageSize.value,
      name: searchQuery.value // 添加搜索参数
    };
    const result = await getUserListService(params);
    users.value = result.data.records || [];
    total.value = parseInt(result.data.total) || 0;
  } catch (error) {
    console.error('Error fetching user list:', error);
    ElMessage.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pageNum.value = 1; // 重置页码到第一页
  userList(); // 执行搜索
};

const showAddUserDialog = () => {
  addUserDialogVisible.value = true;
};

const addUser = async () => {
  // 调用API来添加用户
  const res = await addUserService(newUser.value);
  console.log('Adding user:', newUser.value);
  ElMessage.success(res.data?res.data.msg:'添加成功');
  addUserDialogVisible.value = false;
  // 重置表单
  newUser.value = {
    status: 1,
    account: '',
    password: '',
    name: '',
    mobile: '',
    roleId: null
  };
  // 刷新用户列表
  await userList();
};

const edite = (user) => {
  console.log(user)
  currentUser.value = { ...user }; // 复制用户信息
  editUserDialogVisible.value = true; // 打开编辑对话框
};

const updateUser = async () => {

    const res = await updateUserService(currentUser.value);
    ElMessage.success(res.data?res.data.msg:'更新成功');
    editUserDialogVisible.value = false; // 关闭对话框
    await userList(); // 刷新用户列表
};

const deleteUser = async (id) => {
  try {
    let res = await deleteUserService(id);
    ElMessage.success(res.data ? res.data.msg : '删除成功');
    await userList(); // 刷新用户列表
  } catch (error) {
    ElMessage.error('删除用户失败');
  }
};

// 获取角色列表
const fetchRoleList = async () => {
    const res = await getRoleList();
    console.log(res)
    roleList.value = res.data.records;
    console.log(roleList.value)
};

onMounted(() => {
  userList();
  fetchRoleList(); // 获取角色列表
});
</script>

<style scoped>
.user-list-container {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin: 20px;
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-container {
  display: flex;
  align-items: center;
}

.search-input {
  width: 300px;
  margin-right: 10px;
}

.styled-table {
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.styled-table :deep(th) {
  background-color: #f5f7fa !important;
}

.styled-table :deep(td),
.styled-table :deep(th) {
  padding: 12px 0;
}

.action-button {
  padding: 7px 15px;
  font-size: 12px;
  border-radius: 15px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

</style>