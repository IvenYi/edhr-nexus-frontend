import { ref } from 'vue';
import type { FieldMetaDTO } from '/@/apis/gct-apaas/model';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { FIELD_TYPE, CreateType } from '/@/enums/appEnum';
import { getModelComprehensiveSubModelList } from '/@/apis/gct-apaas/ModelComprehensiveController';

interface IModel {
  key?: string;
  name?: string;
  subModel?: number;
}

export function useBpmnFieldMap() {
  const bpmnFieldMap = ref<
    Record<
      string,
      {
        meta: IModel;
        sort: number;
        fields: FieldMetaDTO[];
      }
    >
  >({});
  const bpmnMasterModelKey = ref('');

  /**
   * 主模型字段
   */
  const bpmnMasterModelFields = ref<FieldMetaDTO[]>([]);

  const filterFieldInfo = (item) => {
    if ([CreateType.BUILTIN, CreateType.SYSTEM].includes(item.createType)) {
      return false;
    }
    // 排除某些字段类型
    if (
      [
        FIELD_TYPE.PRIMARY_KEY,
        FIELD_TYPE.ASSOCIATED_PRIMARY_KEY,
        FIELD_TYPE.SERIAL,
        // FIELD_TYPE.MASTERSLAVE,
        FIELD_TYPE.REF_MULTI,
        FIELD_TYPE.RDO_REF,
        FIELD_TYPE.REF,
        FIELD_TYPE.EXPRESSION,
        FIELD_TYPE.AGG,
        FIELD_TYPE.ESOP,
        FIELD_TYPE.TRANSACTION,
        FIELD_TYPE.LABEL_TEMPLATE,
        FIELD_TYPE.SERIALRULE,
        FIELD_TYPE.PRINTER,
        FIELD_TYPE.MESSAGE_TMPL,
        FIELD_TYPE.RANGE_USER,
        FIELD_TYPE.LABEL_TEMPLATE_REF,
        FIELD_TYPE.DOCUMENT_TEMPLATE,
        FIELD_TYPE.ONLINE_FORM_TEMPLATE,
        FIELD_TYPE.E_DHR_TEMPLATE,
        // FIELD_TYPE.ONLINE_FORM,
        FIELD_TYPE.EXPRESSION_CONDITION,
      ].includes(item.type as any)
    ) {
      return false;
    }

    return true;
  };

  async function _loadMasterFieldListByKey(modelKey, modelName) {
    if (!modelKey) return;
    const res: any = await getFieldMetaList({ modelKey: modelKey });
    bpmnMasterModelKey.value = modelKey;
    bpmnFieldMap.value[modelKey] = {
      meta: { key: modelKey, name: modelName },
      sort: 1,
      fields: (res ?? []).filter(filterFieldInfo).map((item) => {
        if (!item.modelKey) {
          item.modelKey = modelKey;
        }
        return item;
      }),
    };

    bpmnMasterModelFields.value = res.filter(
      (item) =>
        ![CreateType.BUILTIN, CreateType.SYSTEM].includes(item.createType) &&
        ![
          FIELD_TYPE.PRIMARY_KEY,
          FIELD_TYPE.ASSOCIATED_PRIMARY_KEY,
          FIELD_TYPE.SERIAL,
          FIELD_TYPE.RDO_REF,
          FIELD_TYPE.EXPRESSION,
          FIELD_TYPE.AGG,
          FIELD_TYPE.ESOP,
          FIELD_TYPE.TRANSACTION,
          FIELD_TYPE.LABEL_TEMPLATE,
          FIELD_TYPE.SERIALRULE,
          FIELD_TYPE.PRINTER,
          FIELD_TYPE.MESSAGE_TMPL,
          FIELD_TYPE.RANGE_USER,
          FIELD_TYPE.LABEL_TEMPLATE_REF,
          FIELD_TYPE.DOCUMENT_TEMPLATE,
          FIELD_TYPE.ONLINE_FORM_TEMPLATE,
          FIELD_TYPE.E_DHR_TEMPLATE,
          // FIELD_TYPE.ONLINE_FORM,
          FIELD_TYPE.EXPRESSION_CONDITION,
        ].includes(item.type as any),
    );
  }

  async function _loadSubFieldListByKey(modelKey) {
    if (!modelKey) return;
    const res = await getModelComprehensiveSubModelList({
      modelKey,
    });

    (res ?? []).forEach((m, index) => {
      if (!bpmnFieldMap.value[m.key!]) {
        bpmnFieldMap.value[m.key!] = {
          meta: { key: m.key, name: m.name, subModel: m.subModel },
          sort: 1 + (index + 1),
          fields: (m.fieldMetaList ?? []).filter(filterFieldInfo).map((item) => {
            if (!item.modelKey) {
              item.modelKey = modelKey;
            }
            return item;
          }),
        };
      }
    });
  }

  function resetBpmnFieldMap() {
    bpmnFieldMap.value = {};
  }

  function initFieldList(modelKey, modelName) {
    resetBpmnFieldMap();
    const p1 = _loadMasterFieldListByKey(modelKey, modelName);
    const p2 = _loadSubFieldListByKey(modelKey);
    return Promise.all([p1, p2]);
  }

  return {
    initFieldList,
    bpmnFieldMap,
  };
}
