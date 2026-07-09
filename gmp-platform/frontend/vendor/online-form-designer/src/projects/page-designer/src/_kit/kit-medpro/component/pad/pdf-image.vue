<template>
  <div>
    <div v-if="loading" class="h-full w-full flex items-center justify-center">
      <van-loading />
    </div>

    <van-swipe v-else lazy-render>
      <van-swipe-item v-for="image in images" :key="image">
        <img class="h-full w-full object-contain" :src="image" />
      </van-swipe-item>
    </van-swipe>
  </div>
</template>

<script setup lang="ts">
  import { watch, ref } from 'vue';
  import { postFilePdfEncode } from '/@/apis/gct-apaas/MinioController';
  import { Swipe as VanSwipe, SwipeItem as VanSwipeItem, Loading as VanLoading } from 'vant';

  const props = defineProps<{
    url?: any;
  }>();

  const images = ref<string[]>([]);
  const imageIndex = ref<number>(0);
  const loading = ref<boolean>(false);

  watch(
    () => props.url,
    async (value) => {
      if (!value) return;
      images.value = [];
      imageIndex.value = 0;
      loading.value = true;
      const data = await postFilePdfEncode({
        url: value,
      }).finally(() => {
        loading.value = false;
      });
      images.value = data ?? [];
    },
    {
      immediate: true,
    },
  );
</script>

<style scoped lang="less">
  .van-swipe {
    height: 100%;
  }
</style>
