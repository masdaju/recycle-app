<template>
    <el-card class="notification-card">
      <el-form :inline="true" class="filter-form">
        <el-form-item label="时间范围">
          <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY年MM月DD日HH时"
              @change="fetchNotifications"
          />
          <el-button type="danger" :disabled="delList.length===0" @click="deleteNotifications">批量删除</el-button>
        </el-form-item>

      </el-form>

      <el-table :data="notifications" border style="width: 100%" @selection-change="onSelectionChange">
        <el-table-column
            type="selection"
            width="55"
            align="center"
        ></el-table-column>
        <el-table-column prop="message" label="消息内容" />
        <el-table-column
            prop="sentAt"
            label="发送时间"
            width="180"
        >
          <template #default="{ row }">
            <span>{{ formatDate(row.sentAt) }}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          background
          layout="prev, pager, next"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          v-model:current-page="pagination.currentPage"
          @current-change="fetchNotifications"
      />
    </el-card>

</template>

<script setup>
import { ref, onMounted } from "vue";
import { getMyMsgService,delMsgService} from "@/api/notification.js";
import dayjs from "dayjs";
import {ElMessage} from "element-plus";
const delList = ref([]);
const notifications = ref([]);
const dateRange = ref([]);
const pagination = ref({
  total: 0,
  pageSize: 8,
  currentPage: 1,
});

/*const clearTime = () => {
  dateRange.value = [];
  fetchNotifications();
}*/
const deleteNotifications = async () => {
  const res = await delMsgService(delList.value);
  if (res.code === 200) {
    ElMessage.success("删除成功");
    await fetchNotifications();
  } else {
    ElMessage.error("删除失败");
  }
}

const onSelectionChange = (selection) => {
  delList.value = selection.map((item) => item.notificationId)
}
const fetchNotifications = async () => {
  const params = {
    current: pagination.value.currentPage,
    pageSize: pagination.value.pageSize,
    startTime: dateRange.value[0] || null,
    endTime: dateRange.value[1] || null,
  };
  const res = await getMyMsgService(params);
  if (res.code === 200) {
    notifications.value = res.data.records;
    pagination.value.total = Number(res.data.total);
  }
};

const formatDate = (date) => {
  return dayjs(date).format('YYYY年MM月DD日HH时mm分');
};

onMounted(() => {
  fetchNotifications();
});
</script>

<style scoped>
.notification-page {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.notification-card {
  padding: 20px;
}

.filter-form {
  margin-bottom: 20px;
}
</style>
