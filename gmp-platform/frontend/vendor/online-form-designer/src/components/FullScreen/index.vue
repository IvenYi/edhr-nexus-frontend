<template>
  <Tooltip
    :title="getTitle"
    placement="bottom"
    overlayClassName="gct-full-screen-wrap"
    v-if="isShow"
  >
    <span @click="toggleClick" class="text-16px gct-full-screen-box">
      <FullscreenOutlined v-if="!isFullscreen" />
      <FullscreenExitOutlined v-else />
      <slot />
    </span>
  </Tooltip>
</template>
<script lang="ts" setup>
  import { computed, unref, PropType, ref } from 'vue';
  import { Tooltip } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useFullscreen } from '@vueuse/core';
  import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue';

  const props = defineProps({
    el: {
      type: Object as PropType<HTMLElement>,
      default: null,
    },
  });
  const { t } = useI18n();
  const { toggle, isFullscreen } = useFullscreen(props.el);
  const isShow = ref<boolean>(true);

  const toggleClick = () => {
    isShow.value = false;
    toggle();
    setTimeout(() => {
      isShow.value = true;
    }, 100);
  };

  // 重新检查全屏状态
  isFullscreen.value = !!document.fullscreenElement;

  const getTitle = computed(() => {
    return unref(isFullscreen) ? t('sys.tooltipExitFull') : t('sys.tooltipEntryFull');
  });
</script>
