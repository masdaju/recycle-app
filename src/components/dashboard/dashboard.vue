<template>

</template>

<script setup>
const url = window.location.href.trim().split("/")[2]
console.log(url)
window.top.open("https://"+url+"/console/")

</script>

<style scoped>
/* 隐藏 Chrome、Safari 和 Opera 浏览器的滚动条 */
iframe::-webkit-scrollbar {
  display: none;
}

/* 隐藏 IE、Edge 和 Firefox 浏览器的滚动条 */
iframe {
  //-ms-overflow-style: none; /* IE 和 Edge */
  //scrollbar-width: none; /* Firefox */
}
</style>