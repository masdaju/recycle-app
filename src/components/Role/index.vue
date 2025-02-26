  <template>
  <div class="user-list-container">
    <h1 class="page-title">角色列表</h1>
    <div class="table-header">
      <div class="search-container">
        <el-input
            v-model="searchQuery"
            placeholder="搜索用户名"
            class="search-input"
        >
          <template #prefix>
            <el-icon><Search/></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
      <el-button type="primary" :disabled="!userInfoStore.info.resource.includes('addRole')" @click="showAddUserDialog">新增角色</el-button>
    </div>
    <el-table
        :data="roleList"
        v-loading="loading"
        :header-cell-style="{ background: '#f5f7fa' }"
        class="styled-table"
    >
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="170" >
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
          </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="180" >
        <template #default="scope">
          {{ formatDate(scope.row.updateTime) }}
          </template>
      </el-table-column>

      <el-table-column prop="status" label="状态">
        <template #default="scope">
          {{ scope.row.status === 0 ? '禁用' : '启用' }}
          </template>
      </el-table-column>
      <el-table-column prop="name" label="角色名称"  />
      <el-table-column prop="roleValue" label="角色值" min-width="200" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small"  @click="edite(scope.row)" :disabled="!userInfoStore.info.resource.includes('editRole')" class="action-button">编辑</el-button>
          <el-button size="small" type="danger" :disabled="!userInfoStore.info.resource.includes('delRole')" @click="deleteRole(scope.row.id)" class="action-button">删除</el-button>
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
    <el-dialog v-model="addRoleDialogVisible" title="新增用户" width="30%" center>
      <el-form :model="newRole" label-width="100px">
        <el-form-item label="启用状态">
          <el-switch v-model="newRole.status" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="角色名">
          <el-input v-model="newRole.name" />
        </el-form-item>
        <el-form-item label="角色值">
          <el-input v-model="newRole.roleValue" />
        </el-form-item>
        <el-form-item>
          <el-tree
              ref="treeRef"
              :data="data"
              show-checkbox
              node-key="id"
              :default-expanded-keys="[]"
              :props="defaultProps"
              @check="handleCheck"
          />

        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addRoleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addRole">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Edit User Dialog -->
    <el-dialog v-model="editRoleDialogVisible" :show-close="false" title="编辑用户" width="30%" center>
      <el-form :model="currentRole" label-width="100px">
        <el-form-item label="启用状态">
          <el-switch v-model="currentRole.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="角色名">
          <el-input v-model="currentRole.name" />
        </el-form-item>
        <el-form-item label="角色值">
          <el-input v-model="currentRole.roleValue" />
        </el-form-item>
        <el-form-item>
        <el-tree
            ref="treeRef"
            :data="data"
            show-checkbox
            node-key="id"
            :default-expanded-keys="[]"
            :props="defaultProps"
            @check="handleCheck"
        />

        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editVisible">取消</el-button>
          <el-button type="primary" @click="updateRole">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {formatDate} from "@/utils/day.js";
import {ref, onMounted, nextTick} from 'vue';
import {ElMessage, ElTree} from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { getRoleList,addRoleService,editRoleService,deleteRoleService} from "@/api/role.js";
import {getFullTreeService} from '@/api/resource'
import useUserInfoStore from "@/stores/userInfo.js";
const userInfoStore = useUserInfoStore()
const data = ref([])
const leafIds = ref([])
const treeRef = ref()
const defaultProps = {
  children: 'children',
  label: 'name'
}
const getFullTree = async () => {
  const res = await getFullTreeService()
  data.value= res.data
}
// getFullTree()
//返回叶子结点
const handleCheck = () => {
  if (treeRef.value) {
    const checkedNodes = treeRef.value.getCheckedNodes(false, true);
    leafIds.value = checkedNodes
        .filter(node => !node.children || node.children.length === 0)
        .map(node => node.id);
    currentRole.value.resId= leafIds.value
    newRole.value.resId=leafIds.value
    console.log('Selected leaf node IDs:', currentRole.value);

  }
}

const edite = async (role) => {
  currentRole.value = { ...role }; // 先复制角色数据
  editRoleDialogVisible.value = true; // 打开编辑对话框

  // 等待对话框渲染和 DOM 更新完成
  await nextTick();
  // 检查 treeRef 是否存在，确保组件渲染完成
  if (treeRef.value) {
    treeRef.value.setCheckedKeys(role.resId); // 然后再设置勾选的节点
  } else {
    console.error('treeRef is not ready');
  }
};

const pageNum = ref(1);
const total = ref(0);
const pageSize = ref(3);
const loading = ref(false);
const roleList = ref([]); // 角色列表
const searchQuery = ref('');
const addRoleDialogVisible = ref(false);
const editRoleDialogVisible = ref(false);
const newRole = ref({
  status: 0, // 默认启用
  name: '',
  roleValue: '',
  resId: [],
});

const currentRole = ref({
  status: 0, // 默认启用
  name: '',
  roleValue: '',
  resId: [],
});
const editVisible = () => {
  console.log(currentRole.value)
  editRoleDialogVisible.value = false;
}

const onSizeChange = (size) => {
  pageSize.value = size;
  RoleList();
};

const onCurrentChange = (num) => {
  pageNum.value = num;
  RoleList();
};

const RoleList = async () => {
  loading.value = true;
  try {
    const params = {
      current: pageNum.value,
      pageSize: pageSize.value,
      name: searchQuery.value // 添加搜索参数
    };
    const result = await getRoleList(params);
    roleList.value = result.data.records || [];
    total.value = parseInt(result.data.total) || 0;
  } catch (error) {
    console.error('Error fetching user list:', error);
    ElMessage.error('获取列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pageNum.value = 1; // 重置页码到第一页
  RoleList(); // 执行搜索
};

const showAddUserDialog = () => {
  addRoleDialogVisible.value = true;
};
const addRole = async () => {
  console.log(newRole.value)
   let res =await addRoleService(newRole.value)

  // 调用API来添加用户
  ElMessage.success(res.data ? res.data.msg : '添加成功');
  addRoleDialogVisible.value = false;
  // 重置表单
  newRole.value = {
    status: 0, // 默认启用
    name: '',
    roleValue: '',
  };
  // 刷新用户列表
  await RoleList();
};

const updateRole = async () => {
  const res = await editRoleService(currentRole.value);
  ElMessage.success(res.data?res.data.msg:'更新成功');
  editRoleDialogVisible.value = false; // 关闭对话框
  await RoleList(); // 刷新用户列表
};

const deleteRole = async (id) => {
  try {
    let res = await deleteRoleService(id);
    ElMessage.success(res.data? res.data.msg : '删除成功');
    await RoleList(); // 刷新用户列表
  } catch (error) {
    ElMessage.error('删除用户失败');
  }
};

// 获取角色列表

onMounted(() => {
  RoleList();
  getFullTree();
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