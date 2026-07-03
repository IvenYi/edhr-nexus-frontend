<template>
  <ModalWrapper :opts="modalOptions" :class="['scan-modal']">
    <div :class="['scan-modal__content']">
      <a-form-item required :label="$t('sys.edhr.materialNo')" class="scan-form-item">
        <a-input v-model:value="val" @keyup.enter="onEnter" />
      </a-form-item>
    </div>
  </ModalWrapper>
</template>

<script setup lang="ts" name="scan-modal">
  import { reactive, computed, watch, onMounted, ref } from 'vue';
  import { IModal, IModalOptions } from '@gct/runtime';
  import { ModalWrapper } from '/@/components/ui';

  /** 模态框参数 */
  const modalOptions = reactive<IModalOptions>({
    width: 400,
    draggable: true,
    showFooter: false,
    canFullscreen: false,
    wrapClassName: 'gct-draggable-modal',
    mask: false,
  });

  const props = defineProps<{
    modal: IModal;
    onScan: (str: string) => void;
  }>();

  const val = ref();

  const onEnter = (...args) => {
    console.log('onEnter', args, val.value);
    props.onScan(val.value);
    val.value = '';
  };
</script>

<style lang="less" scoped>
  .scan-modal {
    &__content {
      padding: 20px 18px;
      .scan-form-item {
        margin-bottom: 0 !important;
      }
    }
  }
</style>
