
<template>
  <div>

    <el-radio-group v-model="status" @change="onStatusChange" style="margin-bottom: 20px;">
      <el-radio :label="null">全部</el-radio>
      <el-radio :label="0">未发车</el-radio>
      <el-radio :label="1">已发车</el-radio>
      <el-radio :label="2">已完成</el-radio>
    </el-radio-group>
    <el-table :data="scheduleData" stripe style="width: 100%">
      <el-table-column prop="scheduleId" label="调度ID" width="100" />
      <el-table-column prop="collectorId" label="回收员ID" width="100" />
      <el-table-column prop="requestId" label="请求ID" width="100" />
      <el-table-column prop="vehicleId" label="车辆Id" width="100" />
      <el-table-column prop="route" label="路线" width="400" />
      <el-table-column prop="status" label="状态" width="" >
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary"  @click="checkedRoute(scope.row.route)">查看路线</el-button>
          <el-button size="small" type="primary" :disabled="scope.row.status!==0" @click="sendCar(scope.row)">发车</el-button>
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
</template>
<script setup>
import { ref, onMounted } from 'vue'
import {getTransportSchedule,sendCarService} from "@/api/transportschedule.js";
import {ElMessage} from "element-plus";
import {setNotification} from "@/api/notification.js";


const  pageNum = ref(1)
const pageSize = ref(5)
const total = ref(0)
const scheduleData = ref([])
const status = ref()
const checkedRoute = (route) => {
  const encodedRoute = encodeURIComponent(route); // 对路线进行 URL 编码，以确保特殊字符正确显示
  const url = `https://map.baidu.com/m?word=${encodedRoute}`;
  window.open(url, '_blank'); // 在新窗口打开百度地图
}
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
const getStatusLabel = (status) => {
  switch (status) {
    case 0:
      return "未发车";
    case 1:
      return "已发车";
    case 2:
      return "已完成";
    default:
      return "未知状态";
  }
};
const getScheduleData = async () => {
  try {
    const params = {
      current: pageNum.value,
      pageSize: pageSize.value,
      status: status.value,
    };
    const response = await getTransportSchedule(params);
    if (response.code === 200) {
      scheduleData.value = response.data.records || [];
      total.value = parseInt(response.data.total, 10) || 0;
    } else {
      ElMessage.error(response.msg);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("获取数据失败");
  }
};
const onSizeChange = (size) => {
  pageSize.value = size
  getScheduleData()
}
const onCurrentChange = (page) => {
  pageNum.value = page
  getScheduleData()
}
const onStatusChange = () => {
  pageNum.value = 1
  getScheduleData()
}
const sendCar = async (row) => {
  try {
    row.status = 1
    const response = await sendCarService(row);
    if (response.code === 200) {
      ElMessage.success("发车成功");
      await getScheduleData();
      await setNotification({message:"申请Id为"+row.requestId+"的车辆已发车",userId:row.userId})
      await setNotification({message:"你有新的任务编号"+row.requestId,userId:row.collectorId})
    } else {
      ElMessage.error(response.msg);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("发车失败");
  }
}

getScheduleData()


</script>
<style scoped>

</style>