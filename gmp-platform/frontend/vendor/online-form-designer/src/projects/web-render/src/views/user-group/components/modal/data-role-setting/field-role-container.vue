<template>
  <div class="field-role-container">
    <header-action
      :title="t('sys.appDesigner.fieldList')"
      v-model:checked="fieldPermissionEnabled"
    />
    <div class="table-wrap" v-if="fieldPermissionEnabled">
      <a-table
        :dataSource="dataSource"
        :columns="columns"
        :showIndexColumn="false"
        :pagination="false"
        :striped="false"
        :bordered="true"
        :rowSelection="rowSelection"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="field-role-container">
  import { ref, watch, toRaw } from 'vue';
  import HeaderAction from './header-action.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  import type { TableRowSelection } from 'ant-design-vue/lib/table/interface';
  import { ColumnsType } from 'ant-design-vue/es/table/Table.d';
  import type { FieldMetaDTO } from '@/apis/gct-apaas/model';

  const { t } = useI18n();

  const columns: ColumnsType<any> = [
    {
      title: t('sys.appDesigner.field'),
      dataIndex: 'name',
    },
  ];

  interface Props {
    /** 模型key */
    dataSource?: FieldMetaDTO[];
    detail: any;
  }

  const props = defineProps<Props>();

  const selectRows = ref();

  const fieldPermissionEnabled = ref<boolean>(false);

  const rowSelection = ref<TableRowSelection>({
    selectedRowKeys: [],
    onChange: handleRowChange,
  });

  watch(
    [() => props.detail, () => props.dataSource],
    () => {
      if (props.detail) {
        fieldPermissionEnabled.value = props.detail.fieldPermissionEnabled;
        selectRows.value = props.dataSource?.filter((item) =>
          props.detail.fieldPermission.includes(item.key),
        );
        rowSelection.value.selectedRowKeys = selectRows.value.map((item) => item.key);
      }
    },
    { deep: true },
  );

  function handleRowChange(selectedRowKeys, selectedRows) {
    rowSelection.value.selectedRowKeys = selectedRowKeys;
    selectRows.value = selectedRows;
  }

  const getFieldRoleResult = () => {
    return {
      fieldPermissionEnabled: fieldPermissionEnabled.value,
      selectRows: selectRows.value?.map((item) => item.key) || [],
    };
  };

  const resetData = () => {
    selectRows.value = undefined;
    fieldPermissionEnabled.value = false;
    rowSelection.value.selectedRowKeys = [];
  };

  defineExpose({ getFieldRoleResult, resetData });
</script>

<style lang="less" scoped></style>
