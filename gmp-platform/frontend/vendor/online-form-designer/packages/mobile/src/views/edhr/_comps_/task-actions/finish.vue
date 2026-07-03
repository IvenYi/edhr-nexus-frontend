<template>
  <van-button
    @click="() => emit('trigger')"
    class="important-fixed right-0px bottom-30px"
    round
    color="linear-gradient(180deg, #FF7071 0%, #F54547 95%)"
    :style="{
      '--van-button-default-height': '60px',
      '--van-button-normal-font-size': '24px',
      '--van-button-round-radius': '30px 0 0 30px',
      '--van-button-normal-padding': '0 32px',
    }"
  >
    <div class="flex items-center">
      <img class="h-28px w-28px mr-8px" :src="TaskFinishSvg" />
      <span>工序完工</span>
    </div>
  </van-button>
</template>

<script setup lang="ts">
  import TaskFinishSvg from '@mobile/assets/svg/task-finish.svg';

  const emit = defineEmits(['trigger']);
</script>
<style scoped lang="less"></style>
