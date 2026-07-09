<template>
  <div class="h-full flex items-center justify-center">
    <van-empty>
      <van-button round type="primary" class="w-200px" @click="reload">重新加载</van-button>
    </van-empty>
  </div>
</template>

<script setup lang="ts">
  import { useMenus } from '@mobile/views/edhr/_hooks_/useMenus';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const { loadMenus } = useMenus();

  const reload = async () => {
    const data = await loadMenus();
    if (data.length > 0) {
      router.replace({
        name: data[0].linkPage,
      });
    }
  };
</script>
<style scoped lang="less"></style>
