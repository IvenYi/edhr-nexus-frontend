<template>
  <ModalWrapper
    :opts="modalOptions"
    :class="['form-import-modal']"
    :disabled-ok="disabledOk"
    :do-ok="doOk"
  >
    <div :class="['form-import-modal__content']">
      <a-form-item required :label="$t('sys.edhr.mcTable.parseRule')" class="scan-form-item">
        <RdoTreeSelect v-model="val" modelKey="em_barcode_parsing_rules" />
      </a-form-item>
    </div>
  </ModalWrapper>
</template>

<script setup lang="ts" name="form-import-modal">
  import { reactive, computed, ref } from 'vue';
  import { IModal, IModalOptions } from '@gct/runtime';
  import { ModalWrapper } from '/@/components/ui';
  import RdoTreeSelect from '/@web-render/views/edhr-application/components/rdo-tree-select/rdo-tree-select.vue';

  /** 模态框参数 */
  const modalOptions = reactive<IModalOptions>({
    title: $t('sys.edhr.mcTable.changeParseRule'),
    width: 580,
  });

  const props = defineProps<{
    modal: IModal;
    id?: string;
  }>();
  const val = ref(props.id);

  /** 禁用确认按钮 */
  const disabledOk = computed(() => {
    return !val.value;
  });

  const doOk = async () => {
    return {
      ok: true,
      data: val.value,
    };
  };
</script>

<style lang="less" scoped>
  .form-import-modal {
    &__content {
      padding: 24px;
    }
  }
</style>
