import { isNil } from 'lodash-es';
import { OpLogField } from './types';
import { getTraceLogFindByTraceId } from '/@/apis/gct-apaas/TraceLogController';
import { getTraceLogDetailsInfoTree } from '/@/apis/gct-apaas/TraceLogDetailsController';
import { GctPopup } from '@mobile/utils/popup';
import OperationLogListPopup from './operation-log-list-popup.vue';

const operateTypeTitle = {
  detail: $t('sys.detail'),
  insert: $t('sys.insert'),
  update: $t('sys.update'),
};
const toStr = (val) => {
  if (isNil(val) || val === '') {
    return '-';
  }
  if (typeof val === 'string') {
    return val;
  }
  return `${JSON.stringify(val)}`;
};

const transferToLogs = (data: any) => {
  const fields: OpLogField[] = [];
  if (!data) {
    return [];
  }
  if (data.recordFieldJson?.length) {
    data.recordFieldJson.forEach((item) => {
      fields.push({
        field: item.field,
        fieldName: item.fieldName,
        fieldType: item.fieldType,
        beforeValue: item.oldData ? toStr(item.oldData): item.oldDict?.join(','),
        afterValue: item.newData ? toStr(item.newData) : item.newDict?.join(','),
        operationType: operateTypeTitle[data.operationType],
      });
    });
  }

  // 处理子表数据
  if (data.children?.length) {
    data.children.forEach((child) => {
      fields.push({
        field: child.parentFieldKey,
        fieldName: child.parentFieldName,
        beforeValue: '-',
        afterValue: '-',
        operationType: operateTypeTitle.detail,
        subFields: transferToLogs(child),
      });
    });
  }
  return fields;
};

export async function loadDetails(id: string, modelKey: string) {
  const log = await getTraceLogFindByTraceId({ traceId: id, modelKey });
  if (log) {
    const res = await getTraceLogDetailsInfoTree({ traceLogId: log.id! });
    return transferToLogs(res![0]);
  } else {
    // 查不出来设置为空
    return [];
  }
}

export function openSubPopup(field: OpLogField, modelKey: string) {
  GctPopup.open(OperationLogListPopup, {
    logs: field.subFields,
    modelKey,
  });
}
