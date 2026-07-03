<template>
  <basic-table
    :striped="false"
    :bordered="true"
    :showIndexColumn="false"
    :ellipsis="true"
    row-key="id"
    class="model-designer-basic-table"
    :columns="getOnlineFormViewFieldColumns()"
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
    </template>
  </basic-table>
</template>

<script setup lang="ts" name="view-model-field-table">
  import { ref, computed } from 'vue';
  import { BasicTable } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getOnlineFormViewFieldColumns } from '/@app-designer/views/online-form/constants';

  const { t } = useI18n();

  const props = defineProps<{
    model: any;
  }>();

  const searchKey = ref('');

  const filterTableData = computed(() => {
    const list = props.model?.fieldConfig?.fields ?? [];
    if (searchKey.value) {
      return list.filter((item) => {
        return item.key.includes(searchKey.value) || item.name.includes(searchKey.value);
      });
    }
    return list;
  });
</script>

<style lang="less" scoped></style>
