<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->

    <!-- 轮播图 -->
    <el-carousel
        :interval="4000"
        type="card"
        height="400px"
        class="carousel"
    >
      <el-carousel-item v-for="(item) in carouselItems" :key="item.id">
        <img
            :src="item.img"
            class="carousel-image"
            alt="环保宣传图"
            @click="handleImageClick(item.id)"
        />
        <div class="carousel-text">
          <h2>{{ item.title }}</h2>
          <p>{{ item.desc }}</p>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 特色服务 -->
    <el-row :gutter="20" class="service-section">
      <el-col :span="6" v-for="(service, index) in services" :key="index">
        <el-card shadow="hover" class="service-card">
          <img :src="service.icon" class="service-icon" />
          <h3>{{ service.title }}</h3>
          <p>{{ service.description }}</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// 导入图片
import img1 from '@/assets/6.png'; // 请替换为实际图片文件名
import img2 from '@/assets/5.png';
import img3 from '@/assets/3.png';
import icon1 from '@/assets/1.png';
import icon2 from '@/assets/2.png';
import icon3 from '@/assets/4.png';
import icon4 from '@/assets/img_1.png';

// 轮播图数据
const carouselItems = ref([
  {
    id: 4,
    img: img1,
    title: '共建绿色家园',
    desc: '专业回收各类可循环资源'
  },
  {
    id: 5,
    img: img2,
    title: '环保新主张',
    desc: '让废品重获新生'
  },
  {
    id: 6,
    img: img3,
    title: '保护环境人人有责',
    desc: '🧐🥰🥰🥰🥰'
  }
]);

// 特色服务
const services = ref([
  {
    icon: icon1,
    title: '上门回收',
    description: '专业团队上门服务，省时省力'
  },
  {
    icon: icon2,
    title: '有偿回收',
    description: '公平计价，即时结算'
  },
  {
    icon: icon3,
    title: '环保教育',
    description: '传播绿色生活理念'
  },
  {
    icon: icon4,
    title: '在线预约',
    description: '一键预约服务'
  }
]);

// 处理图片点击事件的函数
const handleImageClick = (id) => {
  const clickedItem = carouselItems.value.find(item => item.id === id);
  console.log('点击的图片地址是:', clickedItem.img);
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  padding: 0;
  background-color: #4CAF50;
}

.carousel {
  margin-top: 20px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-text {
  position: absolute;
  bottom: 20%;
  left: 10%;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.service-section {
  padding: 40px 20px;
  background-color: white;
}

.service-card {
  text-align: center;
  transition: transform 0.3s;
}

.service-card:hover {
  transform: translateY(-5px);
}

.service-icon {
  width: 80px;
  height: 80px;
  margin: 10px auto;
}
</style>