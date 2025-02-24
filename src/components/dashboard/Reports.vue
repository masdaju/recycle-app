
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
          <el-button size="small" type="primary" :disabled="scope.row.status!==1" @click="checkQuantity(scope.row)">统计质量</el-button>
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
    <el-dialog v-model="isVisible" title="填写质量" width="500px">
      <div style="display: flex; flex-direction: column;">
        <div v-for="item in inputBox" :key="item.id" style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="flex: 1; text-align: right;">{{ item.wasteName }}:</span>
          <el-input
              v-model="map[item.wasteId]"
              placeholder="请输入数量"
              style="flex: 2; margin-left: 10px;"
              @input="onQuantityInput(item.wasteId)"
              @blur="validateAndFormatQuantity(item.wasteId)"
          />
        </div>
        <div style="text-align: right; margin-top: 20px;">
          <el-button type="primary" @click="confirmQuantity">确认</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import {getScheduleForCollector} from "@/api/transportschedule.js";
import {getRequestWasteById} from "@/api/waste.js";
import {checkQuantityService} from "@/api/waste.js";
import {createReport} from "@/api/report.js";
import {ElMessage} from "element-plus";
import {setNotification} from "@/api/notification.js";
const isVisible = ref(false)
const inputBox = ref([])
const  pageNum = ref(1)
const pageSize = ref(5)
const total = ref(0)
const scheduleData = ref([])
const status = ref()
const map = ref({})
const requestId = ref()

const validateAndFormatQuantity = (wasteId) => {
  const value = map.value[wasteId]

  if (value === null || value === undefined || value === '') {
    ElMessage.error(`Waste ID ${wasteId} 的数量不能为空`)
    map.value[wasteId] = null // 强制设置为 null
    return
  }

  if (!/^\d*\.?\d*$/.test(value)) {
    ElMessage.error(`Waste ID ${wasteId} 的数量必须是数字`)
    map.value[wasteId] = null // 重置非法值
    return
  }

  // 确保值为数字类型
  map.value[wasteId] = parseFloat(value)
}
const onQuantityInput = (wasteId) => {
  const value = map.value[wasteId]
  if (value !== null && value !== undefined && !/^\d*\.?\d*$/.test(value)) {
    // 去掉非法字符
    map.value[wasteId] = value.replace(/[^0-9.]/g, '')
    ElMessage.warning('仅允许输入数字')
  }
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
const cancel = () => {
  isVisible.value = false
  requestId.value = null
  map.value= {}
  inputBox.value = []
}
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
const userId = ref()
const collectorId = ref()
const  checkQuantity = async (row) => {
  requestId.value = row.requestId
  userId.value = row.userId
  collectorId.value = row.collectorId
    let res = await getRequestWasteById(row.requestId)
        inputBox.value = res.data
  console.log(inputBox.value)
        isVisible.value = true
}
const confirmQuantity = async () => {
  let res =await checkQuantityService(map.value,requestId.value)
  if (res.code === 200) {
    ElMessage.success("确认成功")
    await createReport({requestId:requestId.value,userId:collectorId.value})
    await setNotification({message:"你的申请ID为"+requestId.value+"的任务已经处理完成，"+"你赚了"+res.data+"元钱",userId:userId.value})
    await getScheduleData()
    cancel()
  } else {
    ElMessage.error(res.msg)
  }

  cancel()
}
const getScheduleData = async () => {
  try {
    const params = {
      current: pageNum.value,
      pageSize: pageSize.value,
      status: status.value,
    };
    const response = await getScheduleForCollector(params);
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
getScheduleData()


</script>
<style scoped>

</style>