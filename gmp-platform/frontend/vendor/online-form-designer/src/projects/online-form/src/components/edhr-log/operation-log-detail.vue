<template>
  <div :class="[ns.b()]">
    <div
      v-show="logs.length > 0 || edhrLodgs.length > 0"
      class="text-right primary-gct mb4px more-btn"
      @click="isExpand = !isExpand"
    >
      {{ $t('sys.edhr.openDetails') }}
      <i
        class="iconfont text-[12px]"
        :class="[isExpand ? 'icon-pad_arrow_up' : 'icon-pad_arrow_down']"
      ></i>
    </div>
    <OperationLogTable
      v-show="isExpand && logs.length > 0"
      :logs="logs"
      :columns="LogTableColsMap.form"
    />
    <OperationLogTable
      :class="[logs.length > 0 && 'mt20px']"
      v-show="isExpand && edhrLodgs.length > 0"
      :logs="edhrLodgs"
      :columns="LogTableColsMap.edhr"
    />
  </div>
</template>

<script lang="ts" setup name="operation-log-detail">
  import { useNamespace, FIELD_TYPE } from '@gct/runtime';
  import { ref, watch } from 'vue';
  import { getDhrLogFindByTraceId } from '/@/apis/gct-apaas/EdhrLogController';
  import OperationLogTable from './operation-log-table.vue';
  import { isNull } from 'lodash-es';
  import { LogTableColsMap } from './enums';

  const ns = useNamespace('operation-log-detail');

  const props = withDefaults(
    defineProps<{
      traceId?: string;
    }>(),
    {},
  );

  const isExpand = ref(false);
  const logs = ref<any[]>([]);
  const edhrLodgs = ref<any[]>([]);
  const operateTypeTitle = {
    detail: $t('sys.detail'),
    insert: $t('sys.insert'),
    update: $t('sys.update'),
  };

  const toStr = (val, fieldType, fieldId) => {
    if (isNull(val) || val === '') {
      if (
        fieldType === FIELD_TYPE.REPORTER ||
        fieldType === FIELD_TYPE.SIGNATURE ||
        fieldType === FIELD_TYPE.WAREHOUSE_MANAGER
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

    return `${JSON.stringify(val)}`;
  };

  const transferToLogs = (data: any) => {
    let fields: any[] = [];
    if (data?.recordFieldJson?.length) {
      data.recordFieldJson.forEach((item) => {
        fields.push({
          field: item.field,
          fieldName: item.fieldName,
          fieldType: item.fieldType,
          beforeValue: item.oldDict?.length
            ? item.oldDict.join(',')
            : toStr(item.oldData, item.fieldType, item.field),
          afterValue: item.newDict?.length
            ? item.newDict.join(',')
            : toStr(item.newData, item.fieldType, item.field),
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
    const res: any = await getDhrLogFindByTraceId({ traceId: id, modelKey: 'summary' });
    logs.value = res?.formInstList || [];
    edhrLodgs.value = res?.edhrInstList || [];
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
    margin-top: 12px;
    overflow: auto;
  }

  .more-btn {
    cursor: pointer;
  }
</style>
