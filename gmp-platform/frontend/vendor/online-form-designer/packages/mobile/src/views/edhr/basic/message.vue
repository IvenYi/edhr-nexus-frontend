<template>
  <div class="flex flex-col h-full">
    <van-nav-bar class="flex-none" left-arrow @click-left="onClickLeft" />
    <div class="flex-1 overflow-hidden px-20px">
      <message-comp class="important-h-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import MessageComp from '@mobile/components/gctMenu-widgets/message/index.vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const onClickLeft = () => {
    router.back();
  };
</script>
<style scoped lang="less"></style>
