<template>
  <div :class="[ns.b()]">
    <basic-table
      :class="[ns.e('table')]"
      :striped="false"
      :bordered="true"
      rowKey="id"
      :showIndexColumn="false"
      :pagination="false"
      :ellipsis="true"
      :columns="columns || []"
      :data-source="logs"
      :scroll="{ y: 150 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="record[column.dataIndex]">
          {{ record[column.dataIndex] }}
        </template>
        <template v-else>-</template>
      </template>
    </basic-table>
    <!-- <div v-if="showLoadMore" :class="[ns.e('load-more')]">
      <a-button type="link" @click="loadMore">
        <i class="iconfont icon-a-Downarrow"></i>
        {{ t('sys.onlineForm.clickLoadMore') }}
      </a-button>
    </div> -->
  </div>
</template>

<script lang="ts" setup name="operation-log-table">
  import { useNamespace } from '@gct/runtime';
  import { computed, ref } from 'vue';
  import { BasicTable, BasicColumn } from '/@/components/Table';
  import { useI18n } from '/@/hooks/web/useI18n';

  const ns = useNamespace('operation-log-table');
  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      logs: any[];
      columns: BasicColumn[];
    }>(),
    {},
  );

  const ListColumns: BasicColumn[] = [
    {
      title: $t('sys.onlineForm.formIdent'),
      key: 'serialNo',
      dataIndex: 'serialNo',
      ellipsis: true,
    },
    {
      title: $t('sys.onlineForm.formRemarkName'),
      key: 'formInstName',
      ellipsis: true,
      dataIndex: 'formInstName',
    },
    {
      title: $t('sys.appDesigner.printDesign.form.name2'),
      key: 'formTmplName',
      dataIndex: 'formTmplName',
    },
    {
      title: $t('sys.edhr.formNo'),
      dataIndex: 'formTmplCode',
      key: 'formTmplCode',
      ellipsis: true,
      width: 150,
    },
    {
      title: $t('sys.appDesigner.operationType'),
      dataIndex: 'operateType',
      key: 'operateType',
      ellipsis: true,
    },
    {
      title: $t('sys.onlineForm.source'),
      dataIndex: 'source',
      key: 'source',
      ellipsis: true,
    },
  ];

  const pageSize = ref(11);
  const showSize = ref(pageSize.value);

  const showItems = computed(() => props.logs.slice(0, showSize.value));

  const showLoadMore = computed(() => props.logs.length > showSize.value);
  const loadMore = () => {
    showSize.value += pageSize.value;
  };
</script>
<style lang="scss" scoped>
  $operation-log-table: (
    height: 100%,
  );

  @include b(operation-log-table) {
    @include set-component-css-var(operation-log-table, $operation-log-table);
    height: getCssVar(operation-log-table, height);
    overflow: auto;

    @include e(table) {
      // &.vben-basic-table {
      //   height: auto;
      // }
      // :deep(.ant-table-body) {
      //   height: unset !important;
      //   max-height: 100% !important;
      // }
    }

    @include e(load-more) {
      text-align: center;
      margin-top: 12px;

      .iconfont {
        font-size: 12px;
        margin-right: 6px;
      }
    }

    @include e(detail) {
      cursor: pointer;
      color: var(--ant-primary-color);
    }

    @include e(img) {
      width: 78px;
      height: auto;
    }
  }
</style>
