<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.print')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="FormRef"
      :model="varMap"
      autocomplete="off"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item :label="key" v-for="(_value, key) in varMap" :name="key">
        <a-input v-model:value="varMap[key]" />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { usePrinter } from '/@/hooks/develop/usePrinter';
  import { labelInfo } from '../hooks/usePage';

  const { t } = useI18n();
  const { printLabelKey } = usePrinter();
  const varMap = ref();
  const [registerInner, { closeModal }] = useModalInner((payload) => {
    varMap.value = payload;
  });
  const handleOk = () => {
    printLabelKey(
      labelInfo.value?.key,
      {},
      {
        testVar: varMap.value,
        printType: labelInfo.value?.printType,
      },
    );
    closeModal();
  };
  const handleClose = () => {
    varMap.value = {};
  };
</script>

<style scoped></style>
