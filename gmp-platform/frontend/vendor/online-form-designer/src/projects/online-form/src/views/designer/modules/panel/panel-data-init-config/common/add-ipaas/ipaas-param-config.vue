<template>
  <div>
    <div class="ipaas-param-item" @click="openIpaasInputParamModal">{{
      $t('sys.onlineForm.inputParameterConfiguration')
    }}</div>
    <span class="split"></span>
    <div class="ipaas-param-item" @click="openIpaasOutputParamModal">{{
      $t('sys.onlineForm.outputParameterView')
    }}</div>
  </div>
</template>

<script setup lang="ts" name="ipaas-param-config">
  import { watch, reactive, computed, ref } from 'vue';
  import { GctDialog } from '/@/utils/Dialog';
  import InputParamModal from './input-param-modal.vue';
  import OutParamModal from './out-param-modal.vue';

  import type { IJoinIpaasConfig } from '/@online-form/views/designer/types';

  const props = withDefaults(
    defineProps<{
      formData: IJoinIpaasConfig | undefined;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'on-clear-field'): void;
  }>();

  const formState = computed({
    get() {
      return props.formData;
    },
    set(v) {
      if (props.formData) {
        Object.assign(props.formData, v);
      }
    },
  });

  const isOpenOutParamModal = ref(false);

  const openIpaasInputParamModal = async () => {
    console.log('formState', formState);

    GctDialog.open(InputParamModal, {
      metaHeader: formState.value?.metaHeader,
      metaBody: formState.value?.metaBody,
      metaQuery: formState.value?.metaQuery,
      metaUri: formState.value?.metaUri,

      callback: (result) => {
        console.log('result', result);

        Object.assign(formState.value!, {
          metaHeader: result.metaHeader,
          metaBody: result.metaBody,
          metaQuery: result.metaQuery,
          metaUri: result.metaUri,
        });
      },
    });
  };

  const openIpaasOutputParamModal = async () => {
    console.log('formState.value?.outputBodyParameters', formState.value?.outputBodyParameters);
    if (isOpenOutParamModal.value) return;
    isOpenOutParamModal.value = true;
    GctDialog.open(OutParamModal, {
      metaBody: formState.value?.outputBodyParameters,
      callback: (result) => {
        console.log('result', result);
        isOpenOutParamModal.value = false;
      },
    });
  };
</script>

<style scoped lang="less">
  .ipaas-param-item {
    flex: 1;
    color: var(--ant-primary-color);
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;

    .iconfont {
      font-size: 16px;
      line-height: 1;
    }

    &.update {
      color: #de5e5f;
      background-color: #fff;
    }

    &.has-data {
      background-color: var(--ant-primary-color);
      color: #fff;
    }
  }

  .split {
    width: 1px;
    height: 26px;
    background-color: #e6e6e6;
    flex-shrink: 0;
  }
</style>
