<template>
  <Icon :value="src" v-if="logoType === LogoTypeEnum.Icon" :size="size" :color="color" />
  <van-image fit="cover" :src="pathsrc" :show-error="false" v-else :width="size" :height="size" />
</template>

<script setup lang="ts" name="vImage">
  import { toRef } from 'vue';
  import { LogoTypeEnum } from '@mobile/type';
  import Icon from './icon/index.vue';
  import { MOBILE_MINIO_PATH } from '@mobile/utils/const';

  const props = defineProps<{
    src: string;
    logoType?: LogoTypeEnum;
    size: number;
    color?: string;
  }>();

  const pathsrc = MOBILE_MINIO_PATH.value + (props.src || '').replace(/^(\/minio\/)/, '');
</script>
<style scoped lang="less"></style>
