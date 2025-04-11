<template>
  <div class="app-container">
    <div class="page-content">
      <div class="statistic-container">
        <h4>每月回收量统计</h4>
        <!-- 年份选择器 -->
        <div style="margin-bottom: 20px;">
          <el-date-picker
              v-model="selectedYear"
              type="year"
              placeholder="选择年份"
              @change="onYearChange"
          />
        </div>
        <!-- 图表容器 -->
        <div class="chart-container" ref="chartRef3"></div>
      </div>
      <h3>已完成的单数</h3>
      <h4>{{"总计："+wasteType.reduce((sum, item) => sum + item.countNum, 0)}}</h4>
      <div class="chart-container" ref="chartRef2"></div>
      <h3>接收的单数</h3>
      <h4>{{"总计："+allWasteType.reduce((sum, item) => sum + item.countNum, 0)}}</h4>
      <div class="chart-container" ref="chartRef1"></div>
      <h3>回收质量</h3>
      <h4>{{"总计："+messageType.reduce((sum, item) => sum + item.quantity, 0)}}</h4>
      <div class="chart-container" ref="chartRef4"></div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import {getStatistic, getAllStatistic, getStatisticByMonth,getMessByType} from "@/api/statistic.js";

// 用于第一个图表的引用和数据
const chartRef2 = ref(null);
const wasteType = ref([]);

// 用于第二个图表的引用和数据
const chartRef1 = ref(null); // 修改为 chartRef1
const allWasteType = ref([]);
// 获取第一个图表数据的函数
const refresh = async () => {
  try {
    let res = await getStatistic();
    wasteType.value = res.data;
    drawChart2();
  } catch (error) {
    console.error('获取第一个图表数据失败:', error);
  }
};

// 获取第二个图表数据的函数
const refreshAll = async () => {
  try {
    let res = await getAllStatistic();
    allWasteType.value = res.data;
    drawChart1(); // 修改函数调用
  } catch (error) {
    console.error('获取第二个图表数据失败:', error);
  }
};
import {ElMessage} from "element-plus"

// 选中的年份（日期对象），默认当前年份
const selectedYear = ref(new Date())
// 存储统计数据
const sortByMonth = ref([])
// 图表容器引用
const chartRef3 = ref(null)
const refreshByMonth = async () => {
  try {
    // 通过 getFullYear() 提取年份
    let year = new Date(selectedYear.value).getFullYear();
    let res = await getStatisticByMonth(year);
    sortByMonth.value = res.data;
    drawChart3();
  } catch (error) {
    console.error('获取统计数据失败:', error);
    ElMessage.error('获取统计数据失败');
  }
};
const drawChart3 = () => {
  // 构造一个长度为 12 的数组，初始值为 0
  let seriesData = Array(12).fill(0);
  // 遍历返回的数据，设置对应月份的数据
  sortByMonth.value.forEach(item => {
    // 假设 item.month 为数字 1 ~ 12
    let index = item.month - 1; // 转换为数组索引（0~11）
    seriesData[index] = item.countNum;
  });

  const option3 = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        axisTick: { alignWithLabel: true }
      }
    ],
    yAxis: [
      { type: 'value' }
    ],
    series: [
      {
        name: '回收量',
        type: 'bar',
        barWidth: '60%',
        data: seriesData  // 使用处理后的数据
      }
    ]
  };


  nextTick(() => {
    const chartDom3 = chartRef3.value;
    const myChart3 = echarts.init(chartDom3);
    window.addEventListener('resize', () => {
      myChart3.resize();
    });
    myChart3.setOption(option3);
  });
};
const onYearChange = () => {
  refreshByMonth();
};

// 绘制第一个图表的函数
const drawChart2 = () => {
  const option2 = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: wasteType.value.map(item => item.name),
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '回收次数',
        type: 'bar',
        barWidth: '60%',
        data: wasteType.value.map(item => item.countNum),
      }
    ]
  };

  nextTick(() => {
    const chartDom2 = chartRef2.value;
    const myChart2 = echarts.init(chartDom2);

    window.addEventListener('resize', () => {
      myChart2.resize();
    });

    myChart2.setOption(option2);

    myChart2.on('click', (params) => {
      console.log('点击第一个图表的数据:', params.data);
    });
  });
};

const drawChart1 = () => {
  const option1 = {
    xAxis: {
      type: 'category',
      data:  allWasteType.value.map(item => item.name),
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data:  allWasteType.value.map(item => item.countNum),
        type: 'line'
      }
    ]
  };

  nextTick(() => {
    const chartDom1 = chartRef1.value; // 修改为 chartRef1.value
    const myChart1 = echarts.init(chartDom1);

    window.addEventListener('resize', () => {
      myChart1.resize();
    });

    myChart1.setOption(option1);

    myChart1.on('click', (params) => {
      console.log('点击第二个图表的数据:', params.data);
    });
  });
};
const chartRef4 = ref(null)
const messageType = ref([])

const refreshMessages = async () => {
  try {
    let res = await getMessByType();
    messageType.value = res.data;
    drawChart4();
  } catch (error) {
    console.error('获取消息统计失败:', error);
    ElMessage.error('获取消息统计数据失败');
  }
};

const drawChart4 = () => {
  const option4 = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: messageType.value.map(item => item.name),
    },
    yAxis: { type: 'value' },
    series: [{
      data: messageType.value.map(item => item.quantity),
      type: 'bar'
    }]
  };

  nextTick(() => {
    const chartDom4 = chartRef4.value;
    const myChart4 = echarts.init(chartDom4);
    window.addEventListener('resize', () => myChart4.resize());
    myChart4.setOption(option4);
  });
};

onMounted(() => {
  refreshMessages();
  refreshByMonth();
  refresh();
  refreshAll();
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 300px;
}
.app-container {
  display: flex;
  height: 100vh;
}
/* 隐藏 Chrome、Safari 和 Opera 浏览器的滚动条 */
.page-content::-webkit-scrollbar{
  display: none;
}


.page-content {
  width: calc(100% - 200px); /* 页面内容宽度，减去菜单栏宽度 */
  overflow-y: auto; /* 页面内容可滚动 */
}
</style>