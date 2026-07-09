<template>
  <icon-park
    v-if="namespace === IconNamespaceEnum.IconPark"
    :type="iconName"
    :style="{
      '--color': color,
      '--bg-color': background,
    }"
    class="icon-next"
    :key="`${iconName}-${size}`"
    :size="size"
  />
  <svg-icon
    v-else-if="namespace === IconNamespaceEnum.Preset || namespace === IconNamespaceEnum.Platform"
    :name="iconName"
    :style="{
      '--color': color,
      '--bg-color': background,
    }"
    class="icon-next"
    :size="size"
  />
  <i
    v-else-if="namespace === IconNamespaceEnum.Asset"
    class="icon-next"
    :style="{
      '--size': size + 'px',
      '--bg-image': iconBgImage,
    }"
  >
  </i>
  <i
    v-else-if="namespace === IconNamespaceEnum.GctIconFont"
    :class="`gct-iconfont ${iconName}`"
    class="icon-next"
    :style="{
      fontSize: size + 'px',
      lineHeight: 1,
      '--color': color,
      '--bg-color': background,
      '--size': size + 'px',
    }"
  ></i>
  <i
    v-else
    :class="`iconfont ${iconName}`"
    class="icon-next"
    :style="{
      fontSize: size + 'px',
      lineHeight: 1,
      '--color': color,
      '--bg-color': background,
      '--size': size + 'px',
    }"
  ></i>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { IconNamespaceEnum } from '../types';
  import { propTypes } from '/@/utils/propTypes';
  import { IconPark } from '@icon-park/vue-next/es/all';
  import SvgIcon from './SvgIcon.vue';
  import { fileUrlParser } from '/@/components/Cropper/hooks/useFile';

  const props = defineProps({
    value: propTypes.string,
    color: {
      type: String,
      default: '#FFFFFF',
    },
    background: {
      type: String,
      default: 'transparent',
    },
    size: {
      type: Number,
      default: 24,
    },
  });

  /**
   * 图标命名空间
   */
  const namespace = computed(() => {
    const value = props.value;
    // console.log('value', value);
    if (!value) return undefined;
    if (value.includes(':')) {
      return value.split(':')[0];
    } else if (value.startsWith('preset-')) {
      return IconNamespaceEnum.Preset;
    }
    return undefined;
  });

  /**
   * 图标实际名称
   */
  const iconName = computed(() => {
    const value = props.value;
    if (!value) return undefined;
    if (value.includes(':')) {
      return value.split(':')[1];
    }
    return props.value;
  });

  const iconBgImage = computed(() => {
    return `url('${fileUrlParser(iconName.value)}')`;
  });
</script>

<style lang="less" scoped>
  .icon-next {
    display: inline-flex;
    align-items: center;
    color: var(--color);
    background-color: var(--bg-color);
    transition: all 0.3s;
    & > svg {
      transform: translateY(1px);
    }
  }
  i.icon-next {
    height: var(--size);
    width: var(--size);
    background-image: var(--bg-image);
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }
</style>
