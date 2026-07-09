<template>
  <van-popup
    v-model:show="_show"
    v-bind="popupProps"
    :style="{ height: '100vh', width: '375px', overflow: 'hidden', ...extraStyle }"
    @closed="handleClosed"
  >
    <div class="flex flex-col h-full">
      <slot name="header" v-if="showHeader">
        <div class="popup__header">
          <span class="text-16px font-bold">{{ title }}</span>
          <span @click="_show = false" class="h-20px w-20px flex items-center justify-center">
            <van-icon name="cross" size="20" />
          </span>
        </div>
      </slot>

      <div class="popup__body">
        <slot></slot>
      </div>

      <div v-if="showFooter" class="popup__footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = withDefaults(
    defineProps<{
      show: boolean;
      title?: string;
      popupProps: any;
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
    console.log(props.popupProps);
    if (props.popupProps._after_close_ && typeof props.popupProps._after_close_ === 'function') {
      console.log('do _after_close_');
      props.popupProps._after_close_();
    }
  };
</script>

<style scoped lang="less">
  .popup__header {
    box-shadow: -4px 0px 24px 0px rgba(0, 0, 0, 0.16);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    height: 54px;
    font-size: 16px;
    flex: none;
    position: relative;
    z-index: 10;
  }

  .popup__body {
    background: #f7f8fa;
    flex: 1;
    overflow: auto;
  }

  .popup__footer {
    box-shadow: 0px -4px 4px 0px rgba(221, 230, 238, 0.4);
    padding: 8px 16px;
    flex: none;
  }
</style>
