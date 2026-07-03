<template>
  <ModalWrapper :opts="modalOptions" :class="['fail-table-modal']">
    <div :class="['fail-table-modal__content']">
      <BasicGrid
        :class="['fail-table-modal__grid']"
        :columns="columns"
        :data="items"
        :tree-config="{ expandAll: true }"
        :isExpandAll="true"
        :isFitParent="true"
        height="486px"
        size="medium"
      >
        <template #name="{ row }">
          <VersionNameTag :data="row" />
        </template>
        <template #formType="{ row }">
          <FormTypeTag v-if="row.formType" :value="row.formType" />
        </template>
        <template #reason="{ row }">
          <template v-if="row.reason">
            <i class="gct-iconfont icon-shibai fail-icon"></i>
            <span>
              {{ row.reason }}
            </span>
          </template>
        </template>
      </BasicGrid>
    </div>
  </ModalWrapper>
</template>

<script setup lang="ts" name="fail-table-modal">
  import { reactive, computed } from 'vue';
  import { IModal, IModalOptions } from '@gct/runtime';
  import { BasicGrid, EmbedGridColumn, ModalWrapper } from '/@/components/ui';
  import { IImportFailData } from './types';
  import { VersionNameTag } from '../../components';
  import FormTypeTag from '../form-type-tag.vue';

  /** 模态框参数 */
  const modalOptions = reactive<IModalOptions>({
    title: $t('sys.viewDetails'),
    width: 800,
    showOkBtn: false,
    cancelText: $t('sys.closeText'),
  });

  const props = defineProps<{
    modal: IModal;
    items: IImportFailData[];
  }>();

  let columns: EmbedGridColumn[] = [
    {
      title: $t('sys.model.online_form') + $t('sys.name'),
      field: 'name',
      showOverflow: 'tooltip',
      minWidth: 214,
      treeNode: true,
      resizable: true,
      slots: { default: 'name' },
    },
    {
      title: $t('sys.webRender.onlineFormType'),
      field: 'formType',
      minWidth: 160,
      resizable: true,
      slots: { default: 'formType' },
    },
    {
      title: $t('sys.edhr.subcategory'),
      minWidth: 160,
      resizable: true,
      field: 'categoryName',
    },
    {
      title: $t('sys.message.failResult'),
      field: 'reason',
      minWidth: 216,
      showOverflow: true,
      slots: { default: 'reason' },
    },
  ];
</script>

<style lang="less" scoped>
  .fail-table-modal {
    &__content {
      padding: 24px 23px;
    }

    .fail-icon {
      font-size: 14px;
      color: #f54547;
      margin-right: 6px;
    }
  }
</style>
