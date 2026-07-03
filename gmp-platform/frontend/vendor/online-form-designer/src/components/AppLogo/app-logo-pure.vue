<template>
  <div v-if="icon || image" :class="[ns.b(), ns.m(type)]" :style="styleVars">
    <template v-if="type === LogoTypeEnum.Icon">
      <div :class="ns.e('icon')">
        <IconNext :value="icon" :size="iconSize || size" :color="_iconColor" />
      </div>
    </template>
    <template v-else-if="type === LogoTypeEnum.Image">
      <img :class="[ns.e('image')]" :src="transformUrl(image)" alt="" />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { useNamespace } from '@gct/runtime';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { IconNext } from '/@/components/Icon';
  import { computed } from 'vue';

  const ns = useNamespace('app-logo-pure');

  enum LogoTypeEnum {
    /** 图标 */
    Icon = 'ICON',
    /** 图片 */
    Image = 'IMAGE',
  }

  const props = withDefaults(
    defineProps<{
      type?: string; // 类型
      icon?: string;
      size?: number; // 整体的大小
      iconColor?: string; // 图标颜色
      iconBgColor?: string; // 图标背景色
      image?: string; // 图片地址
      iconSize?: number; //图标的大小，图标贴边的时候需要
    }>(),
    {
      type: 'ICON' as LogoTypeEnum,
      size: 32,
      iconColor: '#FFF',
      iconBgColor: '#3370FF',
      iconPadding: 0,
    },
  );

  const _iconColor = computed(() => props.iconColor ?? '#FFF');
  const _iconBgColor = computed(() => props.iconBgColor ?? '#3370FF');

  const styleVars = computed(() => {
    return ns.cssVarBlock({
      size: props.size + 'px',
      'icon-color': _iconColor.value,
      'icon-bg-color': _iconBgColor.value,
    });
  });
</script>

<style lang="scss" scoped>
  $app-logo-pure: (
    icon-color: #ffffff,
    icon-bg-color: #3370ff,
    size: 32px,
  );

  @include b(app-logo-pure) {
    @include set-component-css-var(app-logo-pure, $app-logo-pure);
    display: inline-block;
    overflow: hidden;
    border-radius: 8px;
    width: getCssVar(app-logo-pure, size);
    height: getCssVar(app-logo-pure, size);

    @include e(icon) {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      :deep(i.icon-next) {
        --bg-color: transparent;
        --color: #{getCssVar(app-logo-pure, icon-color)};
      }
    }

    @include e(image) {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    @include m(ICON) {
      background-color: getCssVar(app-logo-pure, icon-bg-color);
    }
  }
</style>
