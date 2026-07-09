<template>
  <van-dialog
    v-model:show="_show"
    width="fit-content"
    v-bind="dialogProps"
    :style="{ ...extraStyle }"
    @closed="handleClosed"
    :show-confirm-button="false"
  >
    <div class="flex flex-col h-full">
      <div v-if="showHeader" class="dialog__header">
        <div class="dialog__header-title">
          <span class="text-17px font-bold">{{ title }}</span>
          <span @click="_show = false" class="h-20px w-20px flex items-center justify-center">
            <van-icon name="cross" size="16" />
          </span>
        </div>
        <slot name="header-bottom"></slot>
      </div>

      <div class="dialog__body">
        <slot></slot>
      </div>

      <div v-if="showFooter" class="dialog__footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </van-dialog>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      show: boolean;
      title?: string;
      dialogProps: any;
      showHeader?: boolean;
      showFooter?: boolean;
      extraStyle?: any;
    }>(),
    {
      showHeader: true,
      showFooter: true,
      extraStyle: {},
    },
  );

  const emit = defineEmits(['update:show']);

  const _show = computed({
    get() {
      return props.show;
    },
    set(v) {
      emit('update:show', v);
    },
  });

  const handleClosed = () => {
    console.log(props.dialogProps);
    if (props.dialogProps?._after_close_ && typeof props.dialogProps._after_close_ === 'function') {
      console.log('do _after_close_');
      props.dialogProps._after_close_();
    }
  };
</script>

<style scoped lang="less">
  .dialog__header {
    box-shadow: -4px 0px 24px 0px rgba(0, 0, 0, 0.16);
    flex: none;
    position: relative;
    z-index: 10;
    color: #1a1d23;
  }
  .dialog__header-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    height: 54px;
    font-size: 16px;
  }

  .dialog__body {
    background: #f7f8fa;
    flex: 1;
    overflow: auto;
  }

  .dialog__footer {
    background: #fff;
    box-shadow: 0px -4px 4px 0px rgba(221, 230, 238, 0.4);
    padding: 8px 16px;
    flex: none;
  }
</style>
