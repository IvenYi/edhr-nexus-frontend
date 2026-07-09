<template>
  <div>
    <div
      class="h54px font-500 text-16px ks-row-middle pl16px border-1px border-solid border-[#E0E3EA]"
    >
      {{ t('sys.pageDesigner.selected') }}
      <span class="pl4px pr4px">{{ rows.length }}</span>
      {{ t('sys.pageDesigner.row') }}
    </div>
    <div class="pl30px pr30px pt20px pb20px">
      <a-table
        :data-source="rows"
        :columns="columns"
        size="middle"
        :pagination="false"
        :scroll="{ y: 430 }"
      >
        <!-- qeqw -->
        <template #bodyCell="{ column, index }">
          <template v-if="column.dataIndex === 'key'">
            <a-tooltip placement="top" :title="t('sys.delete')">
              <i
                class="iconfont icon-shanchu2 error-gct cursor-pointer"
                @click="deleteItem(index)"
              ></i>
            </a-tooltip>
          </template>
        </template>
      </a-table>
    </div>
    <div class="p16px text-right selected-row-modal__footer">
      <a-button class="mr16px" @click="onCancel">{{ t('sys.cancel') }}</a-button>
      <a-button @click="clearAll">{{ t('sys.pageDesigner.clearSelectedRows') }}</a-button>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { DigitsFieldDTO } from '/@/apis/gct-apaas/model';
  import { IModal } from '@gct/runtime';

  const props = defineProps<{
    modal: IModal;
    rows: DigitsFieldDTO[];
    keys: (string | number)[];
  }>();

  console.log('props', props);

  const { t } = useI18n();

  const columns = [
    {
      title: t('sys.FieldName'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('sys.keyOfSth', { sth: t('sys.field') }),
      dataIndex: 'ckey',
      key: 'ckey',
      ellipsis: true,
    },
    {
      title: t('sys.typeOfSth', { sth: t('sys.field') }),
      dataIndex: 'type',
      key: 'type',
      ellipsis: true,
      customRender: ({ text }) => {
        return t(`sys.pageDesigner.fieldCmp.${text}`);
      },
    },
    {
      title: t('sys.category'),
      dataIndex: 'modelCategory',
      ellipsis: true,
      customRender: ({ text }) => {
        return 'entity' === text ? '实体' : '数据';
      },
    },
    {
      title: t('sys.pageDesigner.soModelTitle'),
      dataIndex: 'modelName',
      key: 'modelName',
      ellipsis: true,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'key',
      key: 'key',
      width: 70,
    },
  ];

  const deleteItem = (i) => {
    props.keys.splice(i, 1);
    props.rows.splice(i, 1);
  };

  const clearAll = () => {
    props.keys.splice(0, props.rows.length);
    props.rows.splice(0, props.rows.length);
    props.modal.dismiss();
  };

  const onCancel = () => {
    props.modal.dismiss();
  };
</script>
<style lang="less" scoped>
  .selected-row-modal__footer {
    border-top: 1px solid #e0e3ea;
  }

  :deep(
      .ant-table-thead
        > tr
        > th:not(:last-child):not(.ant-table-selection-column):not(
          .ant-table-row-expand-icon-cell
        ):not([colspan])::before
    ) {
    width: 1px;
  }
</style>
