<template>
  <div>

    <!-- 车辆查询 -->

    <el-input v-model="licensePlateQuery" placeholder="请输入车牌号" class="el-input" @keyup.enter="onSearch" style="width: 200px; margin-bottom: 20px;" />
    <el-button type="primary" @click="onSearch">搜索</el-button>
    <!-- 批量删除按钮 -->
    <el-button type="danger" @click="batchDelete" :disabled="selectedVehicles.length === 0">批量删除</el-button>
    <!-- 添加车辆按钮 -->
    <el-button type="primary" @click="addVehicle">添加车辆</el-button>
    <!-- 车辆列表 -->
    <el-table :data="vehicleData" stripe style="width: 100%" @selection-change="onSelectionChange">
      <el-table-column type="selection" width="100%"></el-table-column>
      <el-table-column prop="vehicleId" label="车辆ID" width="200%" />
      <el-table-column prop="vehicleType" label="车辆类型" width="300%" />
      <el-table-column prop="licensePlate" label="车牌号" width="300" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="editVehicle(scope.row)">修改</el-button>
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



    <!-- 添加车辆弹框 -->
    <el-dialog v-model="dialogVisible" title="添加/修改车辆" width="40%">
      <el-form :model="vehicleForm" label-width="100px">
        <el-form-item label="车辆类型">
          <el-input v-model="vehicleForm.vehicleType" placeholder="请输入车辆类型" />
        </el-form-item>
        <el-form-item label="车牌号">
          <el-input v-model="vehicleForm.licensePlate" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveVehicle">保存</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 修改车辆时设置 Form -->
    <el-dialog v-model="editDialogVisible" title="修改车辆" width="40%">
      <el-form :model="vehicleForm" label-width="100px">
        <el-form-item label="车辆类型">
          <el-input v-model="vehicleForm.vehicleType" placeholder="请输入车辆类型" />
        </el-form-item>
        <el-form-item label="车牌号">
          <el-input v-model="vehicleForm.licensePlate" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveVehicle">保存</el-button>
          <el-button @click="editDialogVisible = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getVehicleService, delVehicleService, updateVehicleService, addVehicleService } from '@/api/vehicle.js'
import { ElMessage, ElMessageBox } from 'element-plus'

const vehicleData = ref([]) // 车辆数据
const total = ref(0) // 总记录数
const pageNum = ref(1) // 当前页码
const pageSize = ref(10) // 每页记录数
const licensePlateQuery = ref() // 查询车牌号，初始为 null
const selectedVehicles = ref([]) // 被选中的车辆
const dialogVisible = ref(false) // 添加车辆弹框显示
const editDialogVisible = ref(false) // 修改车辆弹框显示
const vehicleForm = ref({ vehicleId: '', vehicleType: '', licensePlate: null }) // 车辆表单数据

const onSelectionChange = (selection) => {
  selectedVehicles.value = selection.map((item) => item.vehicleId)
}

// 获取车辆列表数据
const getVehicleData = async () => {
  try {
    const params = {
      current: pageNum.value,
      pageSize: pageSize.value,
      licensePlate: licensePlateQuery.value || null, // 如果没有车牌号，设置为 null
    }
    const response = await getVehicleService(params)
    if (response.code === 200) {
      vehicleData.value = response.data.records || []
      total.value = parseInt(response.data.total, 10) || 0
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  }
}

// 搜索车辆
const onSearch = () => {
  if (!licensePlateQuery.value) {
    licensePlateQuery.value = null // 如果查询框为空，设置为 null
  }
  pageNum.value = 1 // 重置为第一页
  getVehicleData()
}

// 分页变化
const onSizeChange = (size) => {
  pageSize.value = size
  getVehicleData()
}

const onCurrentChange = (page) => {
  pageNum.value = page
  getVehicleData()
}

// 批量删除
const batchDelete = async () => {
  if (selectedVehicles.value.length === 0) {
    ElMessage.warning('请先选择车辆')
    return
  }

  try {
    await ElMessageBox.confirm('确定删除选中的车辆吗?', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await delVehicleService(selectedVehicles.value)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      getVehicleData() // 刷新数据
    } else {
      ElMessage.error(response.msg)
    }
  } catch (error) {
    ElMessage.info('取消删除')
  }
}

// 添加车辆
const addVehicle = () => {
  vehicleForm.value = { vehicleId: '', vehicleType: '', licensePlate: '' } // 清空表单
  dialogVisible.value = true
}

// 保存车辆（添加/更新）
const saveVehicle = async () => {
  const { vehicleType, licensePlate } = vehicleForm.value
  if (!vehicleType || !licensePlate) {
    ElMessage.warning('请填写车辆信息')
    return
  }

  let response
  if (vehicleForm.value.vehicleId) {
    response = await updateVehicleService(vehicleForm.value) // 修改车辆
  } else {
    response = await addVehicleService(vehicleForm.value) // 添加车辆
  }

  if (response.code === 200) {
    ElMessage.success('操作成功')
    dialogVisible.value = false
    editDialogVisible.value = false
    getVehicleData() // 刷新数据
  } else {
    ElMessage.error(response.msg)
  }
}

// 修改车辆
const editVehicle = (vehicle) => {
  vehicleForm.value = { ...vehicle }
  editDialogVisible.value = true
}

// 页面加载时获取数据
onMounted(() => {
  getVehicleData()
})
</script>

<style scoped>
  .el-input{
   margin-top: 18px;
 }
.pagination {
  margin-top: 20px;
}
</style>
