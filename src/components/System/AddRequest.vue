

<template>


  <div class="container">
    <div class="classify">
      <el-checkbox-group v-model="classifyId" size="large">
        <el-checkbox-button v-for="type in types" :key="type.cid"
                            :value="type.cid">
          {{ type.name }}
        </el-checkbox-button>
      </el-checkbox-group>
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
        <el-button type="primary" style="margin-left: 16px"  v-if="!route.query.visible" :disabled="wasteIds.length===0" @click="drawer = true">
          添加
        </el-button>
        <el-button type="primary" style="margin-left: 16px"  v-if="route.query.visible" @click="getNewWid">
          修改
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="card-grid">
      <el-col
          v-for="item in data"
          :key="item.wasteId"
          :xs="24" :sm="12" :md="8" :lg="6"
      >
        <el-card class="card" shadow="hover">
          <img class="card-image" :src="item.imgUrl" :alt="item.name" />
          <div class="card-content">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description || "暂无描述" }}</p>
            <p>价格: {{ item.price }} / {{ item.unit }}</p>
            <p>创建时间: {{ formatDate(item.createDate) }}</p>
          </div>

          <!-- 使用 el-checkbox 的 value 属性来替代 label -->
          <el-checkbox-group v-model="wasteIds">
            <el-checkbox :value="item.wasteId">
              选择
            </el-checkbox>
          </el-checkbox-group>
        </el-card>
      </el-col>
    </el-row>

    <el-pagination
        v-if="total > 0"
        v-model:currentPage="pageNum"
        v-model:pageSize="pageSize"
        :page-sizes="[4,8,16]"
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


  <el-drawer v-model="drawer" title="添加废品请求" :with-header="true" size="30%">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="预约时间" prop="appointmentTime">
        <el-date-picker
            v-model="form.appointmentTime"
            type="datetime"
            placeholder="请选择预约时间"
            style="width: 100%"
            :disabled-date="disabledDate"
            :disabled-hours="disabledHours"
            :disabled-minutes="disabledMinutes"
            :disabled-seconds="disabledSeconds"
        />
      </el-form-item>

      <el-form-item label="地址" prop="address">
        <el-input v-model="form.address" placeholder="请输入地址" />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
            v-model="form.remark"
            placeholder="请输入备注"
            type="textarea"
            :rows="4"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="drawer = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup>
import { ref ,onMounted} from "vue";
import { ElMessage } from "element-plus";
import {addWasteRequestService, getWastePage, getWasteType} from "@/api/waste.js";
import {Search} from "@element-plus/icons-vue";
import {formatDate} from "@/utils/day.js";
import {useRoute} from 'vue-router';
import router from "@/router/index.js";
import {setNotification} from "@/api/notification.js";

const route = useRoute();
const date =new Date()
const rules = {
  appointmentTime: [{ required: true, message: "请选择预约时间", trigger: "change" }],
  address: [{ required: true, message: "请输入地址", trigger: "blur" }],
  remark: [{ required: true, message: "请输入备注", trigger: "blur" }],
};
const formRef = ref();
const disabledDate = (time) => {
  return time.getTime() < date.getTime();
};
const makeRange = (start, end) => {
  const result  = []
  for (let i = start; i <= end; i++) {
    result.push(i)
  }
  return result
}
const disabledHours = () => {
  const day=new Date(form.value.appointmentTime)
  if (day.getDate() === date.getDate()) {
    return makeRange(0, date.getHours() - 1)
  }
  return []
}
const disabledMinutes = () => {
  const day=new Date(form.value.appointmentTime)
  if (day.getDate() === date.getDate()) {
    return makeRange(0, date.getMinutes() - 1)
  }
  return []
}
const disabledSeconds = () => {
  const day=new Date(form.value.appointmentTime)
  if (day.getDate() === date.getDate()) {
    return makeRange(0, date.getSeconds() - 1)
  }
  return []
}

const data = ref([]);
const drawer = ref(false)
const pageNum = ref(1);
const total = ref(10);
const pageSize = ref(8);
const searchQuery = ref("");
const wasteIds = ref([]); // 用于存储被勾选的 wasteId
const classifyId = ref([]);
const types =   ref([])
const form = ref({
  appointmentTime: "",
  address: "",
  remark: "",
  wid:[],
});
const getWasteTypeList = async () => {
  const res = await getWasteType();
  types.value = res.data.records;
}
// 改变每页条数
const onSizeChange = (size) => {
  pageSize.value = size;
  getData();
}

// 改变当前页
const onCurrentChange = (num) => {
  pageNum.value = num;
  getData();
}
const handleSearch = () => {
  pageNum.value = 1; // 重置页码到第一页
  getData();
}
// 获取数据
const getData = async () => {
  let params
  if (classifyId.value.length === 0) {
    params = {
      current: pageNum.value,
      pageSize: pageSize.value,
      name: searchQuery.value,
    };
  }else {
    params = {
      current: pageNum.value,
      pageSize: pageSize.value,
      name: searchQuery.value,
      classifyId: classifyId.value.toString(),
    };
  }
  console.log(classifyId.value.toString())
  const res = await getWastePage(params);
  if (res.code === 200) {
    data.value = res.data.records || [];
    total.value = parseInt(res.data.total) || 0;
  } else {
    ElMessage.error(res.message);
  }
}
const getNewWid = () => {
  router.push({
    path: '/myRequest',
    query: {
      wid: wasteIds.value,//废品Id
      id:route.query.id
    },
  });
}
import useUserInfoStore from '@/stores/userInfo.js'
const userInfoStore = useUserInfoStore()
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        form.value.wid = wasteIds.value;
        const res = await addWasteRequestService(form.value);
        await setNotification({message:"申请创建成功请耐心等待调度员处理",userId:userInfoStore.info.id})
        if (res.code === 200) {
          ElMessage.success("添加成功");
          drawer.value = false;
          getData(); // 重新加载数据
        } else {
          ElMessage.error(res.message);
        }
      } catch (error) {
        ElMessage.error("请求失败，请稍后重试");
      }
    } else {
      ElMessage.error("请填写完整表单");
    }
  });
};


// 初始化数据
getWasteTypeList();
getData();
onMounted(() => {
  if (route.query.request) {
    console.log(route.query.request)
    wasteIds.value= route.query.request
  }
});
</script>

<style scoped>
.search-container {
  display: flex;
  align-items: center;
}
.el-input{
  width: 250px;
}
/* 分类选择区域 */
.classify {
  margin-bottom: 20px; /* 分类区域与卡片之间的间距 */
  padding: 20px 0; /* 增加上下内边距 */
  background-color: #f5f5f5; /* 可选：给分类区域加个背景色 */
}

/* 卡片网格 */
.card-grid {
  margin: 0 auto;
  max-width: 1500px; /* 限制最大宽度 */
}

/* 卡片样式 */
.card {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border-radius: 6px;
  background: #f9f9f9;
}

/* 图片样式 */
.card-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin: 8px auto;
}

/* 卡片内容标题 */
.card-content h3 {
  font-size: 16px;
  margin: 6px 0;
  color: #333;
}

/* 卡片内容文字 */
.card-content p {
  font-size: 12px;
  color: #666;
  margin: 4px 0;
}

/* 翻页组件样式 */
.el-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

</style>
