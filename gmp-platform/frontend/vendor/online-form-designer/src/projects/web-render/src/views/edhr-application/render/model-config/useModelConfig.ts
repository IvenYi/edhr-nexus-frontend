import { ref } from 'vue';
import { createUUID } from 'qx-util';
import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
import { getFieldMetaList, putFieldMetaById } from '/@/apis/gct-apaas/FieldMetaController';
import { FieldMetaDTO } from '@gct/runtime';
import { useI18n } from '/@/hooks/web/useI18n';

interface ICusModelField {
  id_: string;
  model_key_: string;
  model_name_: string;
}

const FIELD_TYPE_WEIGHT = {
  string: 100,
  date: 200,
  int: 300,
  double: 400,
};
const fieldRegexp = /ext_(string|date|int|double)(\d+)_/;

const { t } = useI18n();

function resetExtFieldName(fieldKey?: string) {
  if (!fieldKey) return createUUID();

  const fieldKeyMeta = parseExtField(fieldKey);
  if (fieldKeyMeta) {
    const { prefix, number } = fieldKeyMeta;
    return t(`sys.edhr.modelConfig.${prefix}`) + number;
  }
  return fieldKey + createUUID();
}

function parseExtField(fieldKey: string) {
  const match = fieldKey.match(fieldRegexp);
  if (match) {
    const type = match[1];
    const number = parseInt(match[2], 10);
    const prefix = 'ext_' + type;
    return {
      fullMatch: match[0],
      prefix,
      type, // "string" 或 "date" 或 "int" 或 "double"
      number, // 数字部分 1-10...
    };
  }
  return null;
}

function getNestedValue(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;

  // 支持点号分隔的路径，如 'props.field' 或 'nested.obj.deep.field'
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

export function sortedArrayByFieldKey(arr, fieldPath = 'key'): Array<any> {
  return arr.sort((a, b) => {
    const getFieldNumber = (obj, path) => {
      const fieldKey = getNestedValue(obj, path);
      if (!fieldKey) return Infinity; // 如果没有匹配到，放在最后

      const field = parseExtField(fieldKey);
      if (!field) return Infinity; // 如果没有匹配到，放在最后

      const { number, type } = field;

      // 给类型赋予权重: string 类型权重为 1，date 类型权重为 2，int 类型权重为 3，double 类型权重为 4
      const typeWeight = FIELD_TYPE_WEIGHT[type];

      return typeWeight + number;
    };

    return getFieldNumber(a, fieldPath) - getFieldNumber(b, fieldPath);
  });
}
export function useModelConfig() {
  const tableLoading = ref(false);
  const allRelationFields = ref<FieldMetaDTO[]>([]);
  const fieldSource = ref<FieldMetaDTO[]>([]);
  const modelSource = ref<ICusModelField[]>([]);

  async function getModelSource() {
    try {
      const res = (await postBizServiceByModelKeyByBsKey(
        {
          modelKey: 'em_custom_field_model',
          bsKey: 'listAll',
        },
        {},
      )) as any;
      modelSource.value = res.data;
    } catch (e) {
      modelSource.value = [];
    }
  }

  async function getModelFieldMeta(modelKey: string) {
    try {
      tableLoading.value = true;
      const res = await getFieldMetaList({
        modelKey: modelKey,
      });
      //模型存在的所有自定义外置字段
      allRelationFields.value = (res ?? []).filter((item: any) => !!item.specificConfig?.extField);
      // 当前模型配置使用的外置字段
      fieldSource.value = sortedArrayByFieldKey(
        (res ?? []).filter(
          (item: any) => item.specificConfig?.extField && item.specificConfig?.extUsed,
        ),
      );
    } catch (e) {
      fieldSource.value = [];
      allRelationFields.value = [];
    }
    tableLoading.value = false;
  }

  async function updateFieldMeta(fieldId, fieldMeta: FieldMetaDTO, { isDelete }) {
    if (!fieldId) return;

    const { name, key, required } = fieldMeta;
    await putFieldMetaById(
      {
        id: fieldId,
      },
      {
        ...fieldMeta,
        name: isDelete ? resetExtFieldName(key) : name,
        required: isDelete ? 0 : required,
        specificConfig: {
          ...fieldMeta.specificConfig,
          extUsed: isDelete ? false : true,
        },
      },
    );
  }

  async function getModelFields(modelKey) {
    const res = await getFieldMetaList({
      modelKey: modelKey,
    });
    //模型存在的所有自定义外置字段
    // const data = (res ?? []).filter((item: any) => !!item.specificConfig?.extField);
    // 当前模型配置使用的外置字段
    return sortedArrayByFieldKey(
      (res ?? []).filter(
        (item: any) => item.specificConfig?.extField && item.specificConfig?.extUsed,
      ),
    );
  }

  return {
    tableLoading,
    fieldSource,
    modelSource,
    allRelationFields,
    getModelSource,
    getModelFieldMeta,
    updateFieldMeta,
    getModelFields,
  };
}
