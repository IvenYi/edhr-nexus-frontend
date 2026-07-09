<template>
  <div
    v-if="logoType === 'ICON'"
    class="w90px h90px rounded-6px icon-wrap"
    :style="`background-color:${bgColor ?? ''}`"
  >
    <Icon
      :value="src"
      size="48"
      :color="logoColor || '#fff'"
      :serverAddress="serverAddress + '/minio/'"
    />
  </div>
  <van-image
    fit="cover"
    :src="serverAddress + src"
    :show-error="false"
    v-else
    :width="90"
    :height="90"
  />
</template>

<script setup lang="ts" name="vImage">
  import { toRef } from 'vue';
  import Icon from './icon/index.vue';

  const props = defineProps<{
    src: string;
    logoType?: any;
    bgColor?: string;
    logoColor?: string;
    serverAddress?: string;
  }>();
</script>
<style scoped lang="less">
  .icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    :deep(img) {
      border-radius: 4px;
    }
  }
</style>
