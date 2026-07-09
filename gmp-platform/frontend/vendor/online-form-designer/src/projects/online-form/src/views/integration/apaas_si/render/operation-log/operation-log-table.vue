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
      :columns="ListColumns"
      :data-source="showItems"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'beforeValue' || column.dataIndex === 'afterValue'">
          <div
            v-if="
              record.fieldType === FIELD_TYPE.REPORTER ||
              record.fieldType === FIELD_TYPE.SIGNATURE ||
              record.fieldType === FIELD_TYPE.WAREHOUSE_MANAGER
            "
            class="h-auto flex flex-wrap"
          >
            <template v-if="record[column.dataIndex]?.length">
              <img
                v-for="item in record[column.dataIndex]"
                :key="item.historyId"
                :src="getPreviewUrl(item.url, item.username)"
                :class="[ns.e('img')]"
              />
            </template>

            <span v-else>-</span>
          </div>
          <div v-else-if="record.fieldType === FIELD_TYPE.IMAGE">
            <Image v-if="record[column.dataIndex]" :file-list="record[column.dataIndex]" />
            <span v-else>-</span>
          </div>
          <span v-else>{{ record[column.dataIndex] }}</span>
        </template>

        <template v-if="column.dataIndex === 'operationType'">
          <span v-if="!record.subFields">{{ record.operationType }}</span>
          <span :class="[ns.e('detail')]" v-else @click="OpenSub(record)">{{
            record.operationType
          }}</span>
        </template>
      </template>
    </basic-table>
    <div v-if="showLoadMore" :class="[ns.e('load-more')]">
      <a-button type="link" @click="loadMore">
        <i class="iconfont icon-a-Downarrow"></i>
        {{ t('sys.onlineForm.clickLoadMore') }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup name="operation-log-table">
  import { useNamespace, FIELD_TYPE } from '@gct/runtime';
  import { computed, ref } from 'vue';
  import { BasicTable, BasicColumn } from '/@/components/Table';
  import { OpLogField } from './types';
  import OperationLogTableModal from './operation-log-table-modal.vue';
  import { getPreviewUrl } from '/@/components/Signature';
  import { useI18n } from '/@/hooks/web/useI18n';
  import Image from '/@web-render/render/Event/Modal/components/image.vue'

  const ns = useNamespace('operation-log-table');
  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      logs: OpLogField[];
    }>(),
    {},
  );

  const ListColumns: BasicColumn[] = [
    {
      title: $t('sys.field'),
      dataIndex: 'fieldName',
      key: 'fieldName',
      ellipsis: true,
    },
    {
      title: $t('sys.appDesigner.beforeUpdate'),
      dataIndex: 'beforeValue',
      key: 'beforeValue',
      ellipsis: true,
    },
    {
      title: $t('sys.appDesigner.afterUpdate'),
      dataIndex: 'afterValue',
      key: 'afterValue',
      ellipsis: true,
    },
    {
      title: $t('sys.appDesigner.operationType'),
      dataIndex: 'operationType',
      key: 'operationType',
      ellipsis: true,
    },
  ];

  const pageSize = ref(11);
  const showSize = ref(pageSize.value);
  const sysPath = ref(import.meta.env.VITE_MINIO_PATH);

  const showItems = computed(() => props.logs.slice(0, showSize.value));

  const showLoadMore = computed(() => props.logs.length > showSize.value);
  const loadMore = () => {
    showSize.value += pageSize.value;
  };

  const OpenSub = (field: OpLogField) => {
    gct.openUtil.modal(
      OperationLogTableModal,
      {
        logs: field.subFields,
      },
      {
        title: field.fieldName,
        width: 730,
        height: 665,
        centered: true,
        showCancelBtn: false,
      },
    );
  };
</script>
<style lang="scss" scoped>
  $operation-log-table: (
    height: 100%,
  );

  @include b(operation-log-table) {
    @include set-component-css-var(operation-log-table, $operation-log-table);

    @include e(table) {
      &.vben-basic-table {
        height: auto;
      }

      :deep(.ant-table-body) {
        height: unset !important;
        max-height: 100% !important;
      }
    }

    @include e(load-more) {
      margin-top: 12px;
      text-align: center;

      .iconfont {
        margin-right: 6px;
        font-size: 12px;
      }
    }

    @include e(detail) {
      color: var(--ant-primary-color);
      cursor: pointer;
    }

    @include e(img) {
      width: 78px;
      height: auto;
    }

    height: getcssvar(operation-log-table, height);
    overflow: auto;
  }
</style>
