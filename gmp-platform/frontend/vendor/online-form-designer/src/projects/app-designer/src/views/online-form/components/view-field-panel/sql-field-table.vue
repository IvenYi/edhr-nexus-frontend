<template>
  <basic-table
    :striped="false"
    :bordered="true"
    :showIndexColumn="false"
    :ellipsis="true"
    row-key="id"
    class="model-designer-basic-table"
    :columns="getOnlineFormViewSqlFieldColumns()"
    :dataSource="filterTableData"
    :pagination="false"
  >
    <template #headerTop>
      <a-row justify="space-between" type="flex">
        <a-col style="display: flex">
          <a-input v-model:value="searchKey" :placeholder="t('sys.searchFieldKey')" alowClear>
            <template #prefix>
              <i class="iconfont icon-sousuo1"></i>
            </template>
          </a-input>
        </a-col>
      </a-row>
    </template>
    <template #bodyCell="{ index, column, record }">
      <template v-if="column.key === 'key'">
        <key-outlined v-if="record.primaryKey" class="primary-gct" />
        {{ record.key }}
      </template>
      <template v-if="column.key === 'type'">
        <span>{{ t(`sys.pageDesigner.fieldCmp.${record.type}`) }}</span>
      </template>
      <template v-if="column.key === 'status'">
        <slot name="status" v-bind="{ column, index, record }"></slot>
      </template>
      <template v-if="column.key === 'action'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.edit'),
              onClick: handleRowEdit.bind(null, record, index),
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </basic-table>
</template>

<script setup lang="ts" name="sql-field-table">
  import { ref, computed, toRaw } from 'vue';

  import { message } from 'ant-design-vue';
  import { cloneDeep, pick } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { getOnlineFormViewSqlFieldColumns } from '/@app-designer/views/online-form/constants';
  import EditSqlFieldInfo from '../../modal/edit-sql-field-info.vue';
  import { putSqlViewModelById } from '/@/apis/gct-apaas/SqlViewModelController';

  const { t } = useI18n();

  const props = defineProps<{
    model: any;
  }>();

  const searchKey = ref('');

  const filterTableData = computed(() => {
    const list = (props.model?.fieldConfig ?? []).filter((item) => Boolean(item.enabled));
    if (searchKey.value) {
      return list.filter((item) => {
        return item.key.includes(searchKey.value) || item.name.includes(searchKey.value);
      });
    }
    return list;
  });

  const handleRowEdit = async (record, index) => {
    const result = await gct.openUtil.modal(
      EditSqlFieldInfo,
      { context: { ...toRaw(record) }, params: {} },
      {
        title: t('sys.model.editField'),
        width: 640,
        showFooter: true,
      },
    );
    if (result.ok) {
      Object.keys(result!.data).forEach((key) => {
        record[key] = result!.data[key];
      });

      const data = cloneDeep(toRaw(props.model));
      await putSqlViewModelById(
        {
          id: data.id,
        },
        pick(data, ['dsKey', 'key', 'name', 'script', 'fieldConfig']),
      );

      message.success(t('sys.developer.appCenter.editSuccess'));
    }
  };
</script>

<style lang="less" scoped></style>
