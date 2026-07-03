<template>
  <div class="text-[##797A7D]">在指定时间间隔内未操作页面，即将在{{ lastTime }}后自动断开连接</div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed, onUnmounted } from 'vue';

  const props = defineProps<{
    startRunTime: number;
    loginOutEvent: Function;
  }>();

  const lastTime = ref('');
  setTimer();
  function setTimer() {
    const earlyTime = (props.startRunTime - new Date().getTime()) / 1000;
    if (earlyTime < 0) {
      return true;
    }
    const Minute = Math.floor(earlyTime / 60);
    const Second = Math.floor(earlyTime % 60);
    lastTime.value = ` ${Minute} 分 ${Second} 秒`;
    return false;
  }
  const timer = setInterval(() => {
    const loginOut = setTimer();
    if (loginOut) {
      clearInterval(timer);
      props.loginOutEvent();
    }
  }, 1000);
  onUnmounted(() => {
    console.log('onUnmounted');
    clearInterval(timer);
  });
</script>
<style scoped lang="less"></style>
