<template>
  <statistic-countdown
    v-if="deadline"
    :value="deadline"
    :format="hour ? 'H 时 m 分 s 秒' : minute ? ' m 分 s 秒' : ' s 秒'"
    :valueStyle="{ 'font-size': '12px', 'font-weight': 400, color: '#5A5F6B' }"
    @finish="props.closeModalEvent()"
  >
    <template #prefix> 密码错误次数已到限制，账号被锁定，请在 </template>
    <template #suffix>
      <span>后重试</span>
    </template>
  </statistic-countdown>
</template>
<script lang="ts" setup>
  import { ref, onUnmounted } from 'vue';
  import { StatisticCountdown } from 'ant-design-vue';

  const props = defineProps<{
    time?: string;
    closeModalEvent: Function;
  }>();

  const hour = ref();
  const minute = ref();

  const deadline = ref();

  function setTimer() {
    const second = +props.time.slice(-2);
    hour.value = +props.time.slice(0, 2);
    minute.value = +props.time.slice(2, 4);

    deadline.value = Date.now() + (hour.value * 60 * 60 + minute.value * 60 + second) * 1000;
  }
  setTimer();

  onUnmounted(() => {
    // clearInterval(timer);
  });
</script>
<style lang="less" scoped></style>
