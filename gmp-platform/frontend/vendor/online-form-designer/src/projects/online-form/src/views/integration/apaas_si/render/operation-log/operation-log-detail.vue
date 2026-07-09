<template>
  <div :class="[ns.b()]">
    <OperationLogTable :logs="logs" />
  </div>
</template>

<script lang="ts" setup name="operation-log-detail">
  import { useNamespace, FIELD_TYPE } from '@gct/runtime';
  import { ref, watch } from 'vue';
  import { getTraceLogFindByTraceId } from '/@/apis/gct-apaas/TraceLogController';
  import { getTraceLogDetailsInfoTree } from '/@/apis/gct-apaas/TraceLogDetailsController';
  import OperationLogTable from './operation-log-table.vue';
  import { OpLogField } from './types';
  import { isNil } from 'lodash-es';

  const ns = useNamespace('operation-log-detail');

  const props = withDefaults(
    defineProps<{
      traceId?: string;
      modelKey?: string;
    }>(),
    {},
  );

  const logs = ref<OpLogField[]>([]);
  const operateTypeTitle = {
    detail: $t('sys.detail'),
    insert: $t('sys.insert'),
    update: $t('sys.update'),
    deleted: $t('sys.delete'),
  };

  const toStr = (val, fieldType, fieldId) => {
    if (isNil(val) || val === '') {
      if (
        fieldType === FIELD_TYPE.REPORTER ||
        fieldType === FIELD_TYPE.SIGNATURE ||
        fieldType === FIELD_TYPE.WAREHOUSE_MANAGER ||
        fieldType === FIELD_TYPE.IMAGE
      ) {
        return '';
      }
      return '-';
    }
    if (
      fieldType === FIELD_TYPE.REPORTER ||
      fieldType === FIELD_TYPE.SIGNATURE ||
      fieldType === FIELD_TYPE.WAREHOUSE_MANAGER
    ) {
      const o = JSON.parse(val || '[]');
      return o;
    }

    // 文件表单字段
    if (fieldId === 'file_' && fieldType === FIELD_TYPE.ATTACHMENT) {
      return val?.map((i) => i.name).join(';');
    }
    if (fieldType === FIELD_TYPE.IMAGE) {
      return val;
    }
    return `${JSON.stringify(val)}`;
  };

  const transferToLogs = (data: any) => {
    let fields: OpLogField[] = [];
    if (data?.recordFieldJson?.length) {
      data.recordFieldJson.forEach((item) => {
        const { fieldType } = item;
        let beforeValue;
        let afterValue;
        if (
          fieldType === FIELD_TYPE.REPORTER ||
          fieldType === FIELD_TYPE.SIGNATURE ||
          fieldType === FIELD_TYPE.WAREHOUSE_MANAGER
        ) {
          beforeValue = item.oldData
            ? toStr(item.oldData, item.fieldType, item.field) : item.oldDict?.join(',');
          afterValue = item.newData
            ? toStr(item.newData, item.fieldType, item.field) : item.newDict?.join(',');
        } else {
          beforeValue = item.oldDict?.length
            ? item.oldDict.join(',')
            : toStr(item.oldData, item.fieldType, item.field);
          afterValue = item.newDict?.length
            ? item.newDict.join(',')
            : toStr(item.newData, item.fieldType, item.field);
        }
        fields.push({
          field: item.field,
          fieldName: item.fieldName,
          fieldType: item.fieldType,
          beforeValue,
          afterValue,
          operationType: operateTypeTitle[data.operationType],
        });
      });
    }

    // 处理子表数据
    if (data?.children?.length) {
      data.children.forEach((child) => {
        fields.push({
          field: child.parentFieldKey,
          fieldName: child.parentFieldName,
          fieldType: child.fieldType,
          beforeValue: '-',
          afterValue: '-',
          operationType: operateTypeTitle.detail,
          subFields: transferToLogs(child),
        });
      });
    }
    return fields;
  };

  const loadDetails = async (id: string) => {
    const log = await getTraceLogFindByTraceId({ traceId: id, modelKey: props.modelKey });
    if (log) {
      const res = await getTraceLogDetailsInfoTree({ traceLogId: log.id! });
      logs.value = transferToLogs(res![0]);
      console.log('llll details', logs.value);
    } else {
      // 查不出来设置为空
      logs.value = [];
    }
  };

  watch(
    () => props.traceId,
    (id) => {
      if (id) {
        loadDetails(id);
      }
    },
    { immediate: true },
  );
</script>
<style lang="scss" scoped>
  $operation-log-detail: (
    height: 100%,
  );

  @include b(operation-log-detail) {
    @include set-component-css-var(operation-log-detail, $operation-log-detail);

    @include e(table) {
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

    height: getcssvar(operation-log-detail, height);
    overflow: auto;
  }
</style>
