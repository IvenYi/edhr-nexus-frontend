<template>
  <ModalWrapper
    :opts="modalOptions"
    :class="['form-export-modal']"
    :disabled-ok="disabledOk"
    :do-ok="doOk"
    v-loading="loading"
  >
    <div class="text-center py-16px">
      <SelectEx
        class="form-export-modal__step-select"
        show-mode="icon-label"
        icon-type="custom"
        :options="stepOptions"
        style-type="buttons"
        v-model:value="type"
      />
    </div>
    <component
      ref="compRef"
      :is="componentMap[type]"
      :class="['form-export-modal__content']"
      v-model:has-selected="hasSelected"
    />
  </ModalWrapper>
</template>

<script setup lang="ts" name="form-export-modal">
  import { reactive, ref, computed, watchEffect } from 'vue';
  import { useModal, IModal, IModalOptions } from '@gct/runtime';
  import { ModalWrapper } from '/@/components/ui';
  import SelectEx from '@/components/SelectEx/select-ex';
  import ExportCategory from './export-category.vue';
  import ExportTmpl from './export-tmpl.vue';
  import { ExportType } from '.';
  import { postOnlineFormTmplExportExport } from '/@/apis/gct-apaas/FormExportController';
  import { downloadByData } from '/@/utils/file/download';

  /** 模态框参数 */
  const modalOptions = reactive<IModalOptions>({
    title: $t('sys.onlineForm.templateExport'),
    width: 800,
    height: 720,
    okText: $t('sys.export'),
  });

  const props = defineProps<{
    modal: IModal;
    categoryKey?: string;
  }>();

  const compRef = ref();
  const loading = ref(false);

  /** 导入策略 */
  const componentMap = {
    [ExportType.CATEGORY]: ExportCategory,
    [ExportType.TEMPLATE]: ExportTmpl,
  };
  const type = ref(ExportType.CATEGORY);
  const stepOptions = [
    {
      label: $t('sys.onlineForm.exportByCategory'),
      value: ExportType.CATEGORY,
    },
    {
      label: $t('sys.onlineForm.exportByTemplate'),
      value: ExportType.TEMPLATE,
    },
  ];

  watchEffect(() => {
    modalOptions.width = type.value === ExportType.TEMPLATE ? 1000 : 800;
  });

  /** 是否有选中数据 */
  const hasSelected = ref(false);

  /** 禁用确认按钮 */
  const disabledOk = computed(() => {
    return !hasSelected.value;
  });

  const doOk = async () => {
    const ids = compRef.value.getSelectedIds();
    console.log('ids', ids);

    loading.value = true;
    const { data, headers } = await postOnlineFormTmplExportExport(
      { type: type.value, ids },
      {
        isReturnNativeResponse: true,
        transferToConfig: { responseType: 'blob' },
      },
    );
    const attachment = new URLSearchParams(
      headers?.['content-disposition'].replace('attachment;', '').trim() || '',
    );
    const filename = attachment.get('filename')?.replace(/^"([^"]*)"$/, '$1') || '';
    downloadByData(data, { filename });
    console.log('filename', filename);
    loading.value = false;
    return false;
  };
</script>

<style lang="less" scoped>
  .form-export-modal {
    :deep(.gct-tree-ex) {
      --tree-ex-line-height: 32px;
    }

    &__step-select {
      --gct-select-ex-font-size: 14px;
      border-radius: 6px 6px 6px 6px;
      background: #e8ebf0;
      :deep(.gct-select-ex-option) {
        padding: 2px 24px;
        color: #5a5f6b;
        &:nth-child(n + 2) {
          margin-left: 2px;
        }
        &:hover {
          background: #f6f7f9;
          border-radius: 4px;
        }
        &.is-selected {
          background: #fff;
          color: #1a1d23;
          font-weight: bold;
          border-radius: 4px 4px 4px 4px;
          box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
        }
      }
    }

    &__content {
      height: calc(100% - 68px - 24px);
    }
  }
</style>
