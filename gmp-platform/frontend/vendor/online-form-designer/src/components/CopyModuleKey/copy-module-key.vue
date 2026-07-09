<template>
  <div v-if="isTooltip" class="copy-wrap copy-wrap-tooltip">
    <i
      v-if="isShowCopyIcon && iconPos === 'left'"
      class="iconfont icon-fuzhi primary-gct"
      @click.stop="handleClipboardKey"
      style="margin-right: 4px"
    ></i>
    <a-tooltip>
      <template #title>{{ moduleKey }}</template>
      <slot
        ><span v-if="showText" class="copy-key">{{ moduleKey }}</span></slot
      >
    </a-tooltip>
    <i
      v-if="isShowCopyIcon && iconPos === 'right'"
      class="iconfont icon-fuzhi primary-gct"
      @click.stop="handleClipboardKey"
      style="margin-left: 4px"
    ></i>
  </div>
  <div v-else class="copy-wrap">
    <i
      v-if="isShowCopyIcon && iconPos === 'left'"
      class="iconfont icon-fuzhi primary-gct"
      @click.stop="handleClipboardKey"
      style="margin-right: 4px"
    ></i>
    <slot
      ><span v-if="showText" :style="`font-size: ${fontSize}px; overflow-wrap: anywhere`">{{
        moduleKey
      }}</span></slot
    >
    <i
      v-if="isShowCopyIcon && iconPos === 'right'"
      class="iconfont icon-fuzhi primary-gct"
      @click.stop="handleClipboardKey"
      style="margin-left: 4px"
    ></i>
  </div>
</template>
<script setup lang="ts" name="copy-module-key">
  import { unref, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';

  const { createMessage } = useMessage();
  const { t } = useI18n();

  const props = defineProps({
    /** 内容 */
    moduleKey: {
      type: String,
      require: true,
    },
    /** 是否显示tips */
    isTooltip: Boolean,
    /** 是否支持拷贝 */
    supportCopy: {
      type: Boolean,
      default: true,
    },
    iconPos: {
      type: String,
      default: 'right', //left / right
    },
    showText: {
      type: Boolean,
      default: true,
    },
    fontSize: {
      type: Number,
      default: 14,
    },
  });

  const isShowCopyIcon = computed(() => {
    return props.moduleKey && props.supportCopy;
  });

  function handleClipboardKey() {
    const { isSuccessRef } = useCopyToClipboard(props.moduleKey);
    unref(isSuccessRef) && createMessage.success(t('sys.copySuccess'));
  }
</script>
<style scoped>
  .copy-wrap {
    display: inline-block;
  }
  .iconfont.icon-fuzhi {
    margin-left: 4px;
    line-height: 0.8;
    cursor: pointer;
    position: relative;
    top: 2px;
  }
  .copy-wrap-tooltip {
    display: flex;

    .copy-key {
      display: inline-block;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-all;
    }
  }
</style>
