<template>
  <icon-park
    v-if="namespace === IconNamespaceEnum.IconPark"
    :type="iconName"
    :style="{
      '--color': color,
    }"
    class="icon-next"
    :key="iconName"
    :size="size"
  />
  <svg-icon
    v-else-if="namespace === IconNamespaceEnum.Preset || namespace === IconNamespaceEnum.Platform"
    :name="iconName"
    :style="{
      '--color': color,
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
  import { IconPark } from '@icon-park/vue-next/es/all';
  import SvgIcon from './SvgIcon.vue';

  enum IconNamespaceEnum {
    Preset = 'icon-preset',
    IconPark = 'icon-park',
    Asset = 'icon-assert',
    Platform = 'icon-platform',
  }
  const props = defineProps({
    value: {
      type: String,
      default: '',
    },
    color: {
      type: String,
    },
    background: {
      type: String,
      default: '',
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
    if (value.includes(':')) {
      return value.split(':')[1];
    }
    return props.value;
  });

  const iconBgImage = computed(() => {
    return `url('${import.meta.env.VITE_MINIO_PATH}${iconName.value.startsWith('/') ? '' : '/'}${
      iconName.value
    }')`;
  });
</script>

<style lang="less" scoped>
  .icon-next {
    display: inline-flex;
    transition: all 0.3s;
    color: var(--color);
  }

  i.icon-next {
    width: var(--size);
    height: var(--size);
    background-image: var(--bg-image);
    background-repeat: no-repeat;
    background-position: center center;
    background-size: contain;
  }
</style>
