<template>
  <div class="container">
    <h2>我的预约请求</h2>

    <!-- 批量删除按钮 -->
    <div class="toolbar">
      <el-button
          type="danger"
          :disabled="selectedRequests.length === 0"
          @click="handleBatchDelete"
      >
        批量删除
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
        :data="requests"
        border
        style="width: 100%; margin-top: 20px;"
        stripe
        @selection-change="onSelectionChange"
    >
      <!-- 多选框列 -->

      <el-table-column
          type="selection"
          width="55"
          align="center"
          :selectable="selectableFn"
      >
      </el-table-column>

      <el-table-column prop="requestId" label="请求ID" width="120" align="center" />
      <el-table-column prop="userId" label="用户ID" width="100" align="center" />
      <el-table-column
          label="预约时间"
          align="center"
      >
        <template #default="scope">
          {{ formatDate(scope.row.appointmentTime) }}
        </template>
      </el-table-column>
      <el-table-column
          label="状态"
          width="120"
          align="center"

      >
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" align="center" />
      <el-table-column prop="remark" label="备注" align="center" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" ref="" :disabled="willdisable(scope.row.requestId)||scope.row.status!==0"   @click="updateWasteRequest(scope.row)"  class="action-button">修改</el-button>
          <el-button
              :disabled="scope.row.status !== 2"
              @click="openFeedbackDrawer(scope.row.requestId)"
          >
            提交反馈
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
        v-if="total > 0"
        v-model:currentPage="pageNum"
        v-model:pageSize="pageSize"
        :page-sizes="[5, 10, 20]"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
        class="pagination"
    />
  </div>
  <el-drawer v-model="drawer" title="添加废品请求" :with-header="true" size="30%">
    <el-form :model="form" :rules="rules"  label-width="100px">
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
        <el-button type="primary" @click="toWasteSelect">修改废品</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="drawer = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>

  <el-drawer v-model="feedBackVisitable" >
    <el-form :model="feedbackForm" :rules="feedbackRules" ref="feedbackFormRef" label-width="100px">
      <!-- 反馈内容 -->
      <el-form-item label="反馈内容" prop="content">
        <el-input
            v-model="feedbackForm.content"
            type="textarea"
            placeholder="请输入反馈内容"
            rows="4"
        />
      </el-form-item>

      <!-- 评分 -->
      <el-form-item label="评分" prop="rating">
        <el-rate v-model="feedbackForm.rating" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitFeedback">提交反馈</el-button>
        <el-button @click="feedBackVisitable = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {MyWasteRequestService, deleteWasteRequestService, updateWasteRequestService} from "@/api/waste.js";
import {addFeedback} from "@/api/feedback.js";
import { formatDate } from "@/utils/day.js";
import router from "@/router/index.js";
import {useRoute} from 'vue-router';
const feedbackFormRef = ref(null);
const route = useRoute();
const feedbackForm = ref({
  content: "",
  rating: null,
  requestId: null, // 当前反馈对应的预约请求 ID
});
const feedBackVisitable = ref(false); // 控制反馈抽屉的显示与隐藏
const openFeedbackDrawer = (requestId) => {
  feedbackForm.value.requestId = requestId;
  feedBackVisitable.value = true;
};
const selectableFn = (row, index) => {
  return row.status === 0; // 只有状态为1的行可以被选择
};
const submitFeedback = async () => {
  try {
    // 验证表单
    await feedbackFormRef.value.validate();

    const response = await addFeedback(feedbackForm.value); // 调用接口
    if (response.code === 200) {
      ElMessage.success("反馈提交成功！");
      feedBackVisitable.value = false; // 关闭反馈抽屉
      fetchRequests(); // 刷新预约请求列表
    } else {
      ElMessage.error(response.msg);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("反馈提交失败！");
  }
};
const feedbackRules = {
  content: [{ required: true, message: "请输入反馈内容", trigger: "blur" }],
  rating: [{ required: true, message: "请选择评分", trigger: "change" }],
};
// 数据状态
const requests = ref([]);
const selectedRequests = ref([]); // 存储选中的请求ID
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const drawer = ref(false);
const form = ref({
  requestId: null,
  appointmentTime: "",
  address: "",
  remark: "",
  wid:[],
});

// 获取数据
const fetchRequests = async () => {
  try {
    const params = {
      current: pageNum.value,
      pageSize: pageSize.value,
    };
    const response = await MyWasteRequestService(params);
    if (response.code === 200) {
      requests.value = response.data.records || [];
      total.value = parseInt(response.data.total) || 0;
    } else {
      ElMessage.error(response.msg);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("获取数据失败");
  }
};
const willdisable = (id) => {
   if(route.query.id==null){
     return false
   }else {
      return route.query.id !== id;
   }
};
const toWasteSelect = async () => {
  await router.push({
    path: '/addRequest',
    query: {
      request: form.value.wid,//废品Id
      visible: true, // 显示按钮
      id:form.value.requestId
    },
  });
}
const submitForm = async () => {
  try {
    if (route.query.wid){
      form.value.wid = route.query.wid; // 将废品ID添加到表单数据中
    }
    const response = await updateWasteRequestService(form.value);
    if (response.code === 200) {
      ElMessage.success("修改成功");
      drawer.value = false;
      await fetchRequests(); // 重新获取数据
      route.query.id = null;
      route.query.wid = null;
    } else {
      ElMessage.error(response.msg);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("修改失败");
  }
}
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
          const response = await deleteWasteRequestService(selectedRequests.value);
          if (response.code === 200) {
            ElMessage.success("删除成功");
            await fetchRequests(); // 重新获取数据
            selectedRequests.value = []; // 清空选中项
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
// 状态转换

const getStatusLabel = (status) => {
  switch (status) {
    case 0:
      return "未处理";
    case 1:
      return "处理中";
    case 2:
      return "已完成";
    default:
      return "未知状态";
  }
};
const getStatusTagType = (status) => {
  switch (status) {
    case 0:
      return "warning";
    case 1:
      return "info";
    case 2:
      return "success";
    default:
      return "default";
  }
};
const updateWasteRequest = async (data) => {
  drawer.value = true;
     form.value={...data}
}
// 分页
const onSizeChange = (size) => {
  pageSize.value = size;
  fetchRequests();
};

const onCurrentChange = (page) => {
  pageNum.value = page;
  fetchRequests();
};

// 监听选中项变化
const onSelectionChange = (selection) => {
  selectedRequests.value = selection.map((item) => item.requestId);
};

const date =new Date()
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
const rules = {
  appointmentTime: [{ required: true, message: "请选择预约时间", trigger: "change" }],
  address: [{ required: true, message: "请输入地址", trigger: "blur" }],
  remark: [{ required: true, message: "请输入备注", trigger: "blur" }],
};
const disabledSeconds = () => {
  const day=new Date(form.value.appointmentTime)
  if (day.getDate() === date.getDate()) {
    return makeRange(0, date.getSeconds() - 1)
  }
  return []
}
// 页面挂载时初始化数据
onMounted(() => {
  fetchRequests();
});
</script>

<style scoped>
.container {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
  font-size: 24px;
}

.toolbar {
  margin-bottom: 10px;
  text-align: right;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
