<template>
  <div class="pl16px pr16px bg-#F2F5F8 h-100vh pt60px relative">
    <div class="ks-row-middle h60px mt--60px">
      <div class="back-btn gct-iconfont icon-fanhui-padduan" @click="router.back()"></div>
      <span class="text-18px ml20px font-600">{{ route.meta?.navTitle }}</span>
    </div>
    <router-view class="page-content" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';

  const router = useRouter();
  const route = useRoute();
</script>
<style scoped lang="less">
  .page-content {
    height: 100%;
    border-radius: 12px 12px 0 0;
  }

  .back-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgb(0 0 0 / 6%);
    color: #1a1d23;
    line-height: 36px;
    text-align: center;
  }
</style>
