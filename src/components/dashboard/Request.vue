<template>
  <div>
    <!-- 状态筛选 -->
    <el-radio-group v-model="status" @change="onStatusChange" style="margin-bottom: 20px;">
      <el-radio :label="null">全部</el-radio>
      <el-radio :label="0">未处理</el-radio>
      <el-radio :label="1">处理中</el-radio>
      <el-radio :label="2">已完成</el-radio>
    </el-radio-group>

    <!-- 车辆请求表格 -->
    <el-table
        :data="requests"
        border
        style="width: 100%; margin-top: 20px;"
        stripe
    >
<!--      <el-table-column prop="requestId" label="请求ID" width="120" align="center" />-->
      <el-table-column prop="userId" label="用户ID" width="100" align="center" />
      <el-table-column label="预约时间" width="150" align="center">
        <template #default="scope">
          {{ formatDate(scope.row.appointmentTime) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ getStatusLabel(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" align="center" />
      <el-table-column prop="remark" label="备注" align="center" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" :disabled="scope.row.status!==0" @click="showDialog(scope.row)" class="action-button">处理</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="DialogVisible" title="处理" width="30%" center>
      <el-form :model="formData" label-width="100px">
        <el-form-item label="用户ID">
          <el-input v-model="formData.userId" disabled></el-input>
          </el-form-item>
        <el-form-item label="请求ID">
          <el-input v-model="formData.requestId" disabled></el-input>
          </el-form-item>
        <el-form-item label="路线">
          <el-input v-model="formData.route" disabled></el-input>
        </el-form-item>
        <el-form-item label="回收员ID">
          <el-select v-model="formData.collectorId" placeholder="请选择回收员" style="width: 240px">
            <el-option
                v-for="item in collectorList"
                :key="item.id"
                :label="item.name+'     账号:'+item.account"
                :value="item.id"
            />
            <template #footer>
              <el-button v-if="!isCollectorQuery" text bg size="small" @click="onCollectorQuery">
                通过账号查询
              </el-button>
              <template v-else>
                <el-input
                    v-model="collectorQuery"
                    class="option-input"
                    placeholder="输入账号"
                    size="small"
                />
                <el-button type="primary" size="small" @click="onCollectorConfirm">
                  确定
                </el-button>
                <el-button size="small" @click="clearCollectorQuery">取消</el-button>
              </template>
            </template>
          </el-select>
          </el-form-item>
        <el-form-item label="车辆ID">

          <el-select v-model="formData.vehicleId" placeholder="选择车辆" style="width: 240px">
            <el-option
                v-for="item in vehicleList"
                :key="item.vehicleId"
                :label="item.vehicleType+'     车牌:'+item.licensePlate"
                :value="item.vehicleId"
            />
            <template #footer>
              <el-button v-if="!isQuery" text bg size="small" @click="onQuery">
               通过车牌查询
              </el-button>
              <template v-else>
                <el-input
                    v-model="licensePlateQuery"
                    class="option-input"
                    placeholder="输入车牌"
                    size="small"
                />
                <el-button type="primary" size="small" @click="onConfirm">
                  确定
                </el-button>
                <el-button size="small" @click="clear">取消</el-button>
              </template>
            </template>
          </el-select>
          </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="DialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
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
import { ref } from "vue";
import { formatDate } from "@/utils/day.js";
import { getWasteRequestByStatus } from "@/api/waste.js";
import {resolveRequestService} from "@/api/transportschedule.js";
//获取回收员列表可以通过账户名继续搜索
import {getCollectorList} from "@/api/user.js";
import {getVehicleService} from "@/api/vehicle.js";
import { ElMessage } from "element-plus";
import {setNotification} from "@/api/notification.js";
const isQuery = ref(false);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(5);
const requests = ref([]);
const status = ref(null); // 默认值为 null，表示全部
const  DialogVisible =ref(false)
const collectorQuery = ref();
const licensePlateQuery = ref();
const vehicleList = ref([]);
const  collectorList = ref([]);
const isCollectorQuery = ref(false);
const formData = ref({
  collectorId: "",
  requestId: "",
  userId: "",
  vehicleId: "",
  route: "",

})

const getVehicleData = async () => {
  try {
    const params = {
      licensePlate: licensePlateQuery.value || null,
      status:1// 如果没有车牌号，设置为 null
    }
    const response = await getVehicleService(params)
    if (response.code === 200) {
      vehicleList.value = response.data.records || []
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  }
}
const getCollectorData = async () => {
  try {
    const params = {
      account: collectorQuery.value || null,
    };
    const response = await getCollectorList(params);
    if (response.code === 200) {
      collectorList.value = response.data || [];
    } else {
      ElMessage.error(response.msg);
    }
  } catch (error) {
    ElMessage.error("获取回收员数据失败");
  }
};

const onCollectorQuery = () => {
  isCollectorQuery.value = true;
};

const clearCollectorQuery = () => {
  collectorQuery.value = "";
  isCollectorQuery.value = false;
};

const onCollectorConfirm = () => {
  getCollectorData();
  isCollectorQuery.value = false;
};
const onQuery = () => {
  isQuery.value = true
}
const clear = () => {
  licensePlateQuery.value = null
  isQuery.value = false
}
const showDialog =(row)=>{
    DialogVisible.value = true
     formData.value = {
       requestId: row.requestId,
       userId: row.userId,
       route: row.address,
     }
}
const onConfirm = () => {
  getVehicleData()
   isQuery.value = false
}
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
const submitForm = async () => {
      try {
        const response = await resolveRequestService(formData.value);
        if (response.code === 200) {
          ElMessage.success("处理成功");
          DialogVisible.value = false;
          await getRequests(); // 重新获取数据
          await setNotification({message:"你的申请已被处理",userId:formData.value.userId})
          await setNotification({message:"你被安排处理用户ID为"+formData.value.userId+"的任务",userId:formData.value.collectorId})
        } else {
          ElMessage.error(response.msg);
        }
      } catch (error) {
        console.error(error);
        ElMessage.error("处理失败");
      }finally {
        await getVehicleData()
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

const getRequests = async () => {
  try {
    const params = {
      current: pageNum.value,
      pageSize: pageSize.value,
      status: status.value,
    };
    const response = await getWasteRequestByStatus(params);
    if (response.code === 200) {
      requests.value = response.data.records || [];
      total.value = parseInt(response.data.total, 10) || 0;
    } else {
      ElMessage.error(response.msg);
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("获取数据失败");
  }
};

// 处理状态筛选变化
const onStatusChange = () => {
  pageNum.value = 1; // 重置为第一页
  getRequests(); // 重新获取数据
};

// 分页变化
const onSizeChange = (size) => {
  pageSize.value = size;
  getRequests();
};

const onCurrentChange = (page) => {
  pageNum.value = page;
  getRequests();
};
getCollectorData()
getVehicleData()
getRequests(); // 初始化请求
</script>

<style scoped>
.pagination {
  margin-top: 20px;
}
</style>
