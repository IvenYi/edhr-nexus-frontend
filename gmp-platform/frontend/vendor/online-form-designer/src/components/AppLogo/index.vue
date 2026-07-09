<template>
  <div class="app-logo">
    <template v-if="type === LogoTypeEnum.Icon">
      <div class="app-logo--icon">
        <IconNext :value="logo" :size="size" :color="color" />
      </div>
    </template>
    <template v-else-if="type === LogoTypeEnum.Image">
      <img class="app-logo--image" :src="transformUrl(logoThumbnail)" alt="" />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { IconNext } from '/@/components/Icon';

  enum LogoTypeEnum {
    /** 图标 */
    Icon = 'ICON',
    /** 图片 */
    Image = 'IMAGE',
  }

  const props = withDefaults(
    defineProps<{
      layout?: number; //布局大小
      padding?: number;
      radius?: number; // 圆角
      type?: string; // 类型
      logo?: string;
      size?: number; // 图标大小
      color?: string; // 图标颜色
      background?: string; // 图标背景色
      logoThumbnail?: string;
    }>(),
    {
      layout: 76,
      padding: 9,
      radius: 4,
      type: 'ICON' as LogoTypeEnum,
      size: 32,
    },
  );
</script>

<style lang="less" scoped>
  .app-logo {
    width: v-bind("props.layout + 'px'");
    height: v-bind("props.layout + 'px'");
    padding: v-bind("props.padding + 'px'");
    border-radius: v-bind("props.radius + 'px'");
    background-color: #f4f4f4;
    line-height: 1;

    &:has(img) {
      padding: 0;
    }

    &--icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      border-radius: v-bind("props.radius + 'px'");
      background-color: v-bind('props.background');
    }

    &--image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
</style>
