<template>
  <van-popup
    :closeable="false"
    v-model:show="showPopup"
    destroy-on-close
    position="right"
    style="height: 100%"
    :style="{
      width: bindAttrs?.displayFields && bindAttrs.displayFields.length > 1 ? '800px' : '480px',
    }"
    :teleport="teleport"
  >
    <div class="popup-container">
      <div class="popup-title ks-row-middle pl-16px pr-10px">
        <div class="ks-col ell">{{ bindAttrs.title }}</div>
        <div class="px-2 py-1 text-[#a6a6a6] cursor-pointer" @click="cancel">
          <i class="gct-iconfont icon-guanbi-Paddanchuang"></i>
        </div>
      </div>
      <div class="ks-col relative">
        <TemplateList v-bind="bindAttrs" @confirm="submit" @cancel="cancel" />
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import type { openPopupType } from './types.ts';
  import TemplateList from './template.vue';
  import { usePadTeleport } from '@mobile/utils/usePadTeleport';

  const { teleport } = usePadTeleport();
  const showPopup = ref(false);
  const bindAttrs = ref();
  const resolveCallback = ref(null);
  function openPicker(arg: openPopupType) {
    bindAttrs.value = arg;
    showPopup.value = true;
    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  }
  function submit(values, options) {
    cancel();
    resolveCallback.value && resolveCallback.value({ values, options });
  }
  function cancel() {
    showPopup.value = false;
  }
  defineExpose({ openPicker });
</script>
<style scoped lang="less">
  // :deep(.van-icon.van-icon-cross.van-popup__close-icon) {
  // color: #a6a6a6;
  // }

  .popup-title {
    height: 56px;
    border-bottom: 1px solid #e0e3eb;
    color: #1a1d23;
    font-size: 17px;
    font-weight: 600;
  }

  .popup-container {
    display: flex;
    position: absolute;
    top: 0;
    bottom: 0;
    flex-direction: column;
    width: 100%;
  }
</style>
