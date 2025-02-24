<template>
  <div>
    <div class="table-header">
      <div class="search-container">
        <el-input
            v-model="searchQuery"
            placeholder="搜索"
            class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <el-table
        :data="tableData"
        style="width: 100%; margin-bottom: 20px;"
        row-key="id"
        :default-expand-all="false"
        border
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="name" label="名称" sortable></el-table-column>
      <el-table-column prop="createTime" label="创建时间" sortable width="180">
        <template #default="{ row }">
          <span>{{ formatDate(row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" sortable width="180">
        <template #default="{ row }">
          <span>{{ formatDate(row.updateTime) }}</span>
          </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" sortable width="160"></el-table-column>
      <el-table-column prop="resValue" label="资源值" width="180"></el-table-column>
<!--      <el-table-column prop="type" label="" width="180"></el-table-column>-->
      <el-table-column prop="status" label="状态" >
        <template #default="scope">
          {{ scope.row.status === 1? '启用' : '禁用' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="showResourceDialog(scope.row)" :disabled="!userInfoStore.info.resource.includes('addRes')" class="action-button">新增</el-button>
          <el-button size="small"  @click="edite(scope.row)" :disabled="!userInfoStore.info.resource.includes('editRes')" class="action-button">编辑</el-button>
          <el-button size="small" type="danger" :disabled="!userInfoStore.info.resource.includes('delRes')"  @click="deleteResource(scope.row.id)" class="action-button">删除</el-button>
<!--          :disabled="!userInfoStore.info.resource.includes('delres')"-->
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
    <el-dialog v-model="showResourceVisible" :show-close="false"  :title="addVisitable? '新增资源' : '编辑资源'" width="30%" center>
      <el-form :model="newRes" label-width="100px">
        <el-form-item  label="启用状态" :required="true">
          <el-radio v-model="newRes.status" :label= "1">启用</el-radio>
          <el-radio v-model="newRes.status" :label= "0">禁用</el-radio>
        </el-form-item>
        <el-form-item v-if="addVisitable" label="是否是根id" :required="true" >
          <el-radio v-model="newRes.pid" :label= "0">是</el-radio>
          <el-radio v-model="newRes.pid" :label= "newRes.id">否</el-radio>
        </el-form-item>
        <el-form-item label="资源名">
          <el-input v-model="newRes.name" />
        </el-form-item>

        <el-form-item label="资源类型">
          <el-input v-model="newRes.type" />
            </el-form-item>
        <el-form-item label="资源路径">
          <el-input v-model="newRes.path" />
          </el-form-item>
        <el-form-item label="资源值">
          <el-input v-model="newRes.resValue" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeResourceDialog">取消</el-button>
          <el-button type="primary" v-if="addVisitable" @click="addResource">添加</el-button>
          <el-button type="primary" v-if="editeVisitable" @click="updateResource">修改</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import {formatDate} from "@/utils/day.js";
import { ref } from 'vue';
import { getResourceTree,addResourceService,deleteResourceService,updateResourceService} from "@/api/resource.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {Search} from "@element-plus/icons-vue";
import useUserInfoStore from "@/stores/userInfo.js";
const userInfoStore = useUserInfoStore()
const loading = ref(false);
const ids = ref([]);
const searchQuery = ref('');
const tableData = ref([]);
const pageNum = ref(1);
const total = ref(10);
const pageSize = ref(3);
const showResourceVisible = ref(false);
const addVisitable = ref(false);
const editeVisitable = ref(false);
const newRes = ref({
  id: null,
  status: 1,
  name: '',
  resValue: '',
  type:'',
  path: '',
  pid: 0,
});
const clearForm = () => {
  newRes.value = {
    id: null,
    status: null,
    name: '',
    pid: null,
    type:'',
    path: '',
    resValue: ''

  };
}

const closeResourceDialog = () => {
  clearForm();

  addVisitable.value= false;
  editeVisitable.value = false;
  showResourceVisible.value = false;
}
const showResourceDialog = row => {
  clearForm()
  newRes.value.id=row.id
  addVisitable.value = true;
  showResourceVisible.value = true;
};
const edite =row=>{
  newRes.value = {...row}
  editeVisitable.value = true;
  showResourceVisible.value = true;
}
const handleSearch = () => {
  pageNum.value = 1; // 重置页码到第一页
  ResourceTree();
}
const onSizeChange = (size) => {
  pageSize.value = size;
  ResourceTree();
};
const onCurrentChange = (num) => {
  pageNum.value = num;
  ResourceTree();
};

const updateResource=async ()=>{
  newRes.value.updateTime= null
  try {
    await updateResourceService(newRes.value);
    ElMessage.success('修改成功');
    closeResourceDialog();
    await ResourceTree();
  } catch (error) {
    console.error('Error updating resource:', error);
    ElMessage.error('修改失败');
  }
}

const addResource= async () => {
  newRes.value.id= null
  try {
    await addResourceService(newRes.value);
    ElMessage.success('添加成功');
    closeResourceDialog();
    await ResourceTree();
  } catch (error) {
    console.error('Error adding resource:', error);
    ElMessage.error('添加失败');
  }
}
const deleteResource = async (id) => {
  try {
    await ElMessageBox.confirm(
        '这会删除其节点包括子节点的资源是否继续?',
        '警告',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
        }
    );

    // 如果用户点击了确认，执行删除操作
    await deleteResourceService(id);
    ElMessage.success('删除成功');
    await ResourceTree(); // 刷新列表
  } catch (error) {
    if (error !== 'cancel') { // 排除用户取消操作的情况
      console.error('Error deleting resource:', error);
      ElMessage.error('删除失败');
    }
  }
};

const ResourceTree = async () => {
  loading.value = true;
  try {
    const params = {
      current: pageNum.value,
      pageSize: pageSize.value,
      name: searchQuery.value // 添加搜索参数
    };
    const result = await getResourceTree(params);
    tableData.value = result.data.records || [];
    total.value = parseInt(result.data.total) || 0;
  } catch (error) {
    console.error('Error fetching user list:', error);
    ElMessage.error('获取列表失败');
  } finally {
    loading.value = false;
  }
};
ResourceTree();
</script>

<style>
.el-table {
  /* 修改表格整体样式 */
  font-size: 14px;
  border-collapse: collapse;
  background-color: #fff;
}

.search-container {
  display: flex;
  align-items: center;
}

.el-table th {
  /* 表头样式 */
  background-color: #f5f7fa;
  color: #333;
  font-weight: bold;
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e5e5e5;
}

.el-table td {
  /* 表数据样式 */
  padding: 10px;
  border-bottom: 1px solid #e5e5e5;
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

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>