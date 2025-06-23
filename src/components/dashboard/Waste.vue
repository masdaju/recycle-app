<template>
  <div class="container">
    <div class="classify">
      <el-checkbox-group v-model="classifyId" size="large">
        <el-checkbox-button v-for="type in types" :key="type.cid" :value="type.cid">
          {{ type.name }}
        </el-checkbox-button>
      </el-checkbox-group>
      <div class="search-container">
        <el-input v-model="searchQuery" placeholder="搜索" class="search-input">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>

        <el-button
            type="danger"
            :disabled="selected.length === 0"
            @click="handleBatchDelete"
        >
          批量删除
        </el-button>
        <el-button type="primary" @click="showAdd">添加</el-button>
        <el-button type="primary" @click="addWasteType">添加分类</el-button>
        <el-button type="primary" @click="delWasteType">删除分类</el-button>
      </div>

    </div>

    <!-- 表格展示 -->
    <el-table :data="data" stripe style="width: 100%" @selection-change="onSelectionChange">>
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column prop="name" label="废品名称" width="200" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="price" label="价格" />
      <el-table-column prop="unit" label="单位" />
      <el-table-column prop="createDate" label="创建时间" >
        <template #default="scope">
          {{ formatDate(scope.row.createDate) }}
          </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary"
                     @click="showUpdate(scope.row)" class="action-button">修改</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
        v-if="total > 0"
        v-model:currentPage="pageNum"
        v-model:pageSize="pageSize"
        :page-sizes="[4, 8, 16]"
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
  <el-drawer v-model="drawerVisible" :show-close="false" >
    <el-form :model="formData" label-width="120px" label-position="left">

      <el-form-item label="废品名称" prop="name" :rules="[{ required: true, message: '请输入废品名称', trigger: 'blur' }]">
        <el-input v-model="formData.name" placeholder="请输入废品名称" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description" placeholder="请输入描述" />
      </el-form-item>

      <el-form-item label="分类" prop="cid" :rules="[{ required: true, message: '请选择废品分类', trigger: 'change' }]">
        <el-select v-model="formData.cid" placeholder="请选择废品分类">
          <el-option
              v-for="type in types"
              :key="type.cid"
              :label="type.name"
              :value="type.cid"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="价格" prop="price" :rules="[{ required: true, message: '请输入价格', trigger: 'blur' }]">
        <el-input v-model="formData.price" type="number" placeholder="请输入价格" />
      </el-form-item>

      <el-form-item label="单位" prop="unit" :rules="[{ required: true, message: '请输入单位', trigger: 'blur' }]">
        <el-input v-model="formData.unit" placeholder="请输入单位" />
      </el-form-item>
      <el-form-item label="图片" prop="image">
        <el-upload
            action="#"
            ref="uploadRef"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :on-change="handleFileChange"
            :limit="1"
            accept=".png,.jpg,.jpeg"
            :auto-upload="false"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>


    </el-form>
    <el-button type="primary" v-if="addButtonVisitable" @click="addWaste">添加</el-button>
    <el-button type="primary" v-if="updateButtonVisitable"   @click="updateWaste">修改</el-button>
  <el-button type="primary" @click="cancel">关闭</el-button>
  </el-drawer>
  <el-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="Preview Image" style="height: 500px; width: auto"/>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {getWastePage, getWasteType, delWasteByIdsService,addWasteService,updateWasteService,createWasteTypeService,delWasteTypeService  } from "@/api/waste.js";
import {Plus, Search} from "@element-plus/icons-vue";
import { formatDate } from "@/utils/day.js";


const updateButtonVisitable = ref(false);
const addButtonVisitable = ref(false);
const drawerVisible = ref(false);

const date = new Date();
const data = ref([]);
const pageNum = ref(1);
const total = ref(10);
const pageSize = ref(8);
const searchQuery = ref("");
const classifyId = ref([]);
const types = ref([]);
const selected = ref([]);
const formData = ref({name: "", description: "", cid: "", price: "", unit: "", image: ""})
const file = ref(); // 用于保存上传的图片
const uploadRef = ref();
const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const rawFile = ref();
const handleRemove = (file) => {
  console.log(file)
  uploadRef.value?.remove(file);
}
const handlePictureCardPreview = (file) => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}
const handleFileChange = (uploadFile) => {

  rawFile.value = uploadFile;
  console.log(rawFile.value)
  file.value = uploadFile.raw; // 获取原始文件
};
const addWasteType = async ()=>{
   let name = prompt("输入分类名称")
  console.log(name)
  await createWasteTypeService({name: name})
  await getWasteTypeList()
}
const delWasteType =()=>{
      ElMessageBox.confirm(
    '确定要删除吗?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    await delWasteTypeService(classifyId.value)
    ElMessage({
      type: 'success',
      message: '删除成功',
    })
    await getWasteTypeList()
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除',
    })
  })
}

const clearForm = () => { formData.value = {name: "", description: "", cid: "", price: "", unit: "", image: ""};
  file.value= null;
  };
const showAdd = () => {
  drawerVisible.value = true;
    updateButtonVisitable.value = false;
    addButtonVisitable.value = true;

}
const cancel = () => {
  drawerVisible.value = false;
  clearForm();
}
const showUpdate = (row) => {
  formData.value = { ...row };
  drawerVisible.value = true;
  updateButtonVisitable.value = true;
  addButtonVisitable.value = false;
}

const onSelectionChange = (selection) => {
  selected.value = selection.map((item) => item.wasteId);
};
const getWasteTypeList = async () => {
  const res = await getWasteType();
  types.value = res.data.records;
};

// 改变每页条数
const onSizeChange = (size) => {
  pageSize.value = size;
  getData();
};
const addWaste = async () => {
  const form = new FormData();
  form.append("params", JSON.stringify(formData.value));
  form.append("file", file.value);
  try {
    const response = await addWasteService(form);
    if (response.code === 200) {
      ElMessage.success("添加成功");
      drawerVisible.value = false;
      clearForm();
      window.location.reload()
      await getData(); // 重新获取数据
    } else {
      ElMessage.error(response.msg);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("添加失败");
  }
}

const updateWaste = async () => {
  const form2 = new FormData();
  console.log(JSON.stringify(formData.value))
  form2.append("params", JSON.stringify(formData.value));
  form2.append("file", file.value);
  try {
    const response = await updateWasteService(form2);
    if (response.code === 200) {
      ElMessage.success("修改成功");
      drawerVisible.value = false;
      clearForm();
      await getData(); // 重新获取数据
      if (form2.get("file")) {
        window.location.reload()
      }
    } else {
      ElMessage.error(response.msg);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("修改失败");
  }
};


const handleBatchDelete = () => {
  ElMessageBox.confirm(
      "确定要删除选中的请求吗？",
      "警告",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
  )
      .then(async () => {
        try {
          const response = await delWasteByIdsService(selected.value);
          if (response.code === 200) {
            ElMessage.success("删除成功");
            await   getData(); // 重新获取数据
            selected.value = []; // 清空选中项
          } else {
            ElMessage.error(response.msg);
          }
        } catch (error) {
          console.error(error);
          ElMessage.error("删除失败");
        }
      })
      .catch(() => {
        ElMessage.info("已取消删除");
      });
};
// 改变当前页
const onCurrentChange = (num) => {
  pageNum.value = num;
  getData();
};

const handleSearch = () => {
  pageNum.value = 1; // 重置页码到第一页
  getData();
};

// 获取数据
const getData = async () => {
  let params;
  if (classifyId.value.length === 0) {
    params = {
      current: pageNum.value,
      pageSize: pageSize.value,
      name: searchQuery.value,
    };
  } else {
    params = {
      current: pageNum.value,
      pageSize: pageSize.value,
      name: searchQuery.value,
      classifyId: classifyId.value.toString(),
    };
  }
  const res = await getWastePage(params);
  if (res.code === 200) {
    data.value = res.data.records || [];
    total.value = parseInt(res.data.total) || 0;
  } else {
    ElMessage.error(res.message);
  }
};

// 初始化数据

onMounted(() => {

  getWasteTypeList();
  getData();
});
</script>

<style scoped>
.search-container {
  display: flex;
  align-items: center;
}
.el-input {
  width: 250px;
}
/* 分类选择区域 */
.classify {
  margin-bottom: 20px; /* 分类区域与卡片之间的间距 */
  padding: 20px 0; /* 增加上下内边距 */
  background-color: #f5f5f5; /* 可选：给分类区域加个背景色 */
}

/* 表格样式 */
.el-table {
  margin-top: 20px;
}

/* 翻页组件样式 */
.el-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
