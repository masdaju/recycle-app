<template>
  <div>
    <!-- 筛选状态 -->
    <el-select v-model="status" placeholder="请选择状态" @change="onStatusChange" style="margin-bottom: 20px; width: 200px;">
      <el-option label="未读" value="0"></el-option>
      <el-option label="已读" value="1"></el-option>
    </el-select>

    <!-- 筛选评分 -->
    <el-checkbox-group v-model="rating" @change="onRatingChange" style="margin-bottom: 20px;">
      <el-checkbox label="1" name="rating">1星</el-checkbox>
      <el-checkbox label="2" name="rating">2星</el-checkbox>
      <el-checkbox label="3" name="rating">3星</el-checkbox>
      <el-checkbox label="4" name="rating">4星</el-checkbox>
      <el-checkbox label="5" name="rating">5星</el-checkbox>
    </el-checkbox-group>

    <!-- 反馈列表 -->
    <el-table :data="feedbackData" stripe style="width: 100%">
      <el-table-column prop="feedbackId" label="反馈Id" width="180" />
      <el-table-column prop="rating" label="评分" width="280">
        <template #default="scope">
          <el-rate :disabled="true" v-model="scope.row.rating" />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="280">
        <template #default="scope">
          <el-tag v-if="scope.row.status === 0">未读</el-tag>
          <el-tag v-else type="success">已读</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="requestId" label="申请ID" width="280" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="checkDetails(scope.row)" class="action-button">查看详细</el-button>
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

    <!-- 查看详情的弹框 -->
    <el-dialog v-model="dialogVisible" title="反馈详情" width="40%">
      <el-form :model="feedbackDetails" label-width="100px">
        <el-form-item label="反馈内容">
          <el-input v-model="feedbackDetails.content" type="textarea" rows="4" disabled />
        </el-form-item>
        <el-form-item label="用户账号">
          <el-input v-model="feedbackDetails.account" disabled />
        </el-form-item>
        <el-form-item label="用户姓名">
          <el-input v-model="feedbackDetails.name" disabled />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :disabled="userInfoStore.info.account===feedbackDetails.account" @click="contactUser(feedbackDetails.account)">联系用户</el-button>
          <el-button @click="dialogVisible = false">关闭</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getFeedback, checkedFeedback } from "@/api/feedback.js";
import { ElMessage } from "element-plus";
import useUserInfoStore from "@/stores/userInfo.js";
const userInfoStore = useUserInfoStore();
import { useRouter } from "vue-router";
const router = useRouter();
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const feedbackData = ref([]);
const status = ref(); // 初始值设为 null，防止默认选择
const rating = ref([]); // 用于存储勾选的评分
const dialogVisible = ref(false); // 控制查看详情弹框的显示
const feedbackDetails = ref({
  content: "",
  account: "",
  name: "",
});

// 获取反馈数据
const getFeedbackData = async () => {
  try {
    let params;
    if (rating.value.length === 0) {
      params = {
        current: pageNum.value,
        pageSize: pageSize.value,
        status: status.value,
      };
    } else {
      params = {
        current: pageNum.value,
        pageSize: pageSize.value,
        status: status.value,
        rating: rating.value.toString(),
      };
    }
    const response = await getFeedback(params);
    if (response.code === 200) {
      feedbackData.value = response.data.records || [];
      total.value = parseInt(response.data.total, 10) || 0;
    } else {
      ElMessage.error(response.msg);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("获取数据失败");
  }
};

// 处理评分筛选变化
const onRatingChange = () => {
  pageNum.value = 1; // 重置页码
  getFeedbackData(); // 每当评分选择变化时重新获取数据
};

// 处理状态筛选变更
const onStatusChange = () => {
  pageNum.value = 1; // 重置页码
  getFeedbackData();
};

// 查看反馈详情
const checkDetails = async (row) => {
  feedbackDetails.value.content = row.content;
  feedbackDetails.value.account = row.account;
  feedbackDetails.value.name = row.name;
  dialogVisible.value = true; // 打开弹框
  await checkedFeedback(row.feedbackId);
  await getFeedbackData();
};

// 分页变化
const onSizeChange = (size) => {
  pageSize.value = size;
  getFeedbackData();
};

const onCurrentChange = (page) => {
  pageNum.value = page;
  getFeedbackData();
};

// 页面加载时获取数据
onMounted(() => {
  getFeedbackData();
});

// 联系用户（你的实现逻辑）
const contactUser = (username) => {
  // 你可以在这里调用其他功能来实现联系用户
  router.push({
    path: '/Chat',
    query: {
      username: username,
    },
  });
};
</script>

<style scoped>
</style>
