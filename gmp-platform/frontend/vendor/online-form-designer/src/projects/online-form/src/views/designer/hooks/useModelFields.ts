import { ref, computed } from 'vue';
import { cloneDeep, isEmpty, pick } from 'lodash-es';
import {
  FIELD_TYPE,
  CreateType,
  FieldTypeToJs,
  onlineFormMasterModelTypeEnum,
} from '/@online-form/views/designer/enums/local-field';
import {
  getLocalDesignerFieldList,
  getLocalDesignerModelInfo,
  LOCAL_FORM_MODEL_KEY,
} from './local-designer-cache';

import type { FieldMetaDTO, ModelMetaResponse } from '/@/apis/gct-apaas/model';

interface IBindField {
  field?: string;
  fieldType?: FIELD_TYPE;
  model?: string;
  modelLink?: string;
  fieldLink?: string;
  isFieldModel?: boolean;
  subModelKey?: string;
  subModelType?: string;
  subFieldKey?: string;
  createType?: CreateType;
  refModelKey?: string;
}

interface IAPIS {
  getFieldMetaList?: Function;
  getModelMetaSubModelList?: Function;
  getModelDetail2FieldList?: Function;
  getViewSqlFieldList?: Function;
  getViewModelFieldList?: Function;
  getViewJsFieldList?: Function;
}

export interface IModel {
  key?: string;
  name?: string;
  subModel?: number;
  /**
   *
   */
  subModelType?: onlineFormMasterModelTypeEnum;
}

/** 表单里所有模型信息 */
export type IModelMetaMap = Record<
  string,
  {
    meta: IModel;
    fields: FieldMetaDTO[];
  }
>;

/** 默认接口 */
const Default_Apis: IAPIS = {};

/**
 * 模型字段接口映射 支持初始化时修改
 */
let APIS: IAPIS;

/**
 * 主模型数据
 */
const masterModel = ref<IModel>({});

/**
 * 模型-字段映射
 */
const modelMetaMap = ref<IModelMetaMap>({});

/** 模型详细信息 */
const modelInfoMap = ref<Record<string, ModelMetaResponse>>({});

/**
 * 字段映射信息
 */
const fieldMetaMap = computed(() => {
  const map: Record<string, FieldMetaDTO> = {};
  Object.keys(modelMetaMap.value).forEach((mKey) => {
    modelMetaMap.value[mKey].fields.forEach((field) => {
      map[mKey + '.' + field.key] = field;
    });
  });

  return map;
});

const extraLib = computed(() => {
  const str = Object.keys(modelMetaMap.value)
    .map((mKey) => {
      return modelMetaMap.value[mKey].fields.map((field) => {
        return (
          `    /** \n` +
          `     * ${field.name} \n` +
          `     */ \n` +
          `    ${field.key}: ${FieldTypeToJs[field.type!] ?? 'any'};`
        );
      });
    })
    .flat()
    .join('\n');
  return `declare const GlobalData = { \n` + str + '\n }';
});

/**
 * 根据 模型+字段 获取字段信息
 * @param fieldMeta
 * @param opts
 * @returns
 */
function getFieldMeta(
  fieldMeta: IBindField,
  opts?: { showFullPath?: boolean; showFieldName?: boolean },
) {
  if (isEmpty(fieldMeta)) return {};
  const { showFullPath, showFieldName = true } = opts ?? {};

  if (showFullPath) {
    const modelNames = (fieldMeta.modelLink || fieldMeta.model)?.split('.').map((modelKey) => {
      return modelMetaMap.value[modelKey]?.meta.name;
    });

    const fieldName = fieldMetaMap.value[`${fieldMeta.model!}.${fieldMeta.field!}`]?.name;

    return {
      name: showFieldName ? modelNames?.concat(fieldName) : modelNames,
    };
  }

  return fieldMetaMap.value[`${fieldMeta.model!}.${fieldMeta.field!}`] ?? {};
}

/**
 * 主模型子表字段-子模型数据
 */
const subTableFieldModel = computed(() => {
  const modelKey = masterModel.value.key;
  if (!modelKey) return [];
  const fields = modelMetaMap.value[modelKey]?.fields ?? [];
  // 获取子表字段
  const subModelFields = fields?.filter(
    (item) => item.type === FIELD_TYPE.MASTERSLAVE && item.bindInfo,
  );
  return subModelFields!.map((item) => {
    const model = modelMetaMap.value[item.bindInfo!]?.meta ?? {};
    return {
      field: item!,
      model: model!,
    };
  });
});

function _checkRefModel(item) {
  return (
    item.bindInfo &&
    [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI, FIELD_TYPE.RDO_REF].includes(item.type) &&
    [CreateType.USER_DEFINED, CreateType.BUILTIN].includes(item.createType as CreateType)
  );
}

async function _getChildRefInfo(item) {
  if (typeof APIS.getModelDetail2FieldList !== 'function') {
    return { meta: {}, fields: [] };
  }
  const info = await APIS.getModelDetail2FieldList({ modelKey: item.bindInfo });

  return {
    meta: { key: info.key, name: info.name, subModel: info.subModel },
    fields: (info.fieldMetaList ?? [])
      .map((item) => {
        if (!item.modelKey) {
          item.modelKey = info.key;
        }
        return item;
      })
      .filter((i) => ![FIELD_TYPE.REF, FIELD_TYPE.RDO_REF].includes(i.type)),
  };
}

async function _getRefInfo(item) {
  if (typeof APIS.getModelDetail2FieldList !== 'function') {
    return [];
  }
  const info = await APIS.getModelDetail2FieldList({ modelKey: item.bindInfo });

  const obj = {
    meta: { key: info.key, name: info.name, subModel: info.subModel },
    fields: (info.fieldMetaList ?? []).map((item) => {
      if (!item.modelKey) {
        item.modelKey = info.key;
      }
      return item;
    }),
  };
  const children = info?.fieldMetaList?.filter(_checkRefModel).map(_getChildRefInfo) ?? [];

  const childRefList = await Promise.all(children);

  return [obj, ...childRefList];
}

async function _getSpecialRefInfo(key) {
  if (typeof APIS.getModelDetail2FieldList !== 'function') {
    return [];
  }
  const info = await APIS.getModelDetail2FieldList({ modelKey: key });

  if (!info) {
    return [];
  }

  const obj = {
    meta: { key: info.key, name: info.name, subModel: info.subModel },
    fields: (info.fieldMetaList ?? []).map((item) => {
      if (!item.modelKey) {
        item.modelKey = info.key;
      }
      return item;
    }),
  };

  return [obj];
}

/**
 * 加载模型字段
 * @param key
 * @returns
 */
async function _loadModelFieldsByKey(key?: string) {
  const modelKey = key ?? masterModel.value.key;
  if (!modelKey) return;
  if (modelMetaMap.value[modelKey]) {
    return modelMetaMap.value[modelKey].fields;
  } else {
    if (modelKey === LOCAL_FORM_MODEL_KEY) {
      modelMetaMap.value[modelKey] = {
        meta: { key: LOCAL_FORM_MODEL_KEY, name: getLocalDesignerModelInfo().name },
        fields: getLocalDesignerFieldList(modelKey),
      };
      return modelMetaMap.value[modelKey].fields;
    }

    if (typeof APIS.getFieldMetaList !== 'function') {
      return;
    }

    const displayedFields = [];

    const res = await APIS.getFieldMetaList({
      modelKey,
    });

    let P;
    if (modelKey === 'em_print_master') {
      P = (displayedFields ?? [])?.map(_getSpecialRefInfo) ?? [];
    } else {
      P = (res ?? [])?.filter(_checkRefModel)?.map(_getRefInfo) ?? [];
    }

    const refList = await Promise.all(P);

    modelMetaMap.value[modelKey] = {
      meta: masterModel.value.key ? { ...masterModel.value } : { key: modelKey, name: '' },
      fields: (res ?? [])
        .filter((i) => {
          if (displayedFields && displayedFields.length !== 0) {
            return i.bindInfo && displayedFields.includes(i.bindInfo);
          }
          return true;
        })
        .map((item) => {
          if (!item.modelKey) {
            item.modelKey = modelKey;
          }
          return item;
        }),
    };

    refList.flat().forEach((item) => {
      if (!modelMetaMap.value[item.meta.key]) {
        modelMetaMap.value[item.meta.key] = cloneDeep(item);
      }
    });

    return res;
  }
}

/**
 * 加载子模型及字段
 * @param key
 * @returns
 */
async function _loadDynamicTableModelsFields(key?: string) {
  const modelKey = key ?? masterModel.value.key;
  if (!modelKey) return;
  if (typeof APIS.getModelMetaSubModelList !== 'function') {
    return;
  }
  const res = await APIS.getModelMetaSubModelList({
    modelKey,
  });
  (res ?? []).forEach((m) => {
    if (!modelMetaMap.value[m.key!]) {
      modelMetaMap.value[m.key!] = {
        meta: { key: m.key, name: m.name, subModel: m.subModel, subModelType: m.type },
        fields: (m.fieldMetaList ?? []).map((item) => {
          if (!item.modelKey) {
            item.modelKey = modelKey;
          }
          item.subModelType = m.type;
          return item;
        }),
      };
    }
  });
}

/**
 * 加载视图模型及字段
 * @returns
 */
async function _loadViewModelFieldsByKey(key?: string) {
  const modelKey = key ?? masterModel.value.key;
  if (!modelKey) return;

  if (typeof APIS.getViewSqlFieldList === 'function') {
    const res = await APIS.getViewSqlFieldList({
      modelKey,
    });

    if (res) {
      modelMetaMap.value[modelKey] = {
        meta: masterModel.value.key ? { ...masterModel.value } : { key: res.key, name: res.name },
        fields: (res.fieldConfig ?? [])
          .filter((item) => Boolean(item.enabled))
          .map((item, index) => {
            return {
              ...pick(res, [
                'id',
                'createTime',
                'createUserId',
                'createUserName',
                'modifyTime',
                'modifyUserId',
                'modifyUserName',
              ]),
              ...pick(item, ['key', 'name', 'type', 'column', 'enabled']),
              modelKey: modelKey,
              columnType: null,
              createType: 'SYSTEM',
              description: null,
              bindInfo: null,
              refModelType: null,
              sortNum: index,
              masterFieldKey: null,
            };
          }),
      };
    }
  } else if (typeof APIS.getViewModelFieldList === 'function') {
    const res = await APIS.getViewModelFieldList({
      id: modelKey,
    });

    if (res) {
      modelMetaMap.value[modelKey] = {
        meta: masterModel.value.key ? { ...masterModel.value } : { key: res.key, name: res.name },
        fields: (res.fieldConfig?.fields ?? []).map((item, index) => {
          return {
            ...pick(res, [
              'createTime',
              'createUserId',
              'createUserName',
              'modifyTime',
              'modifyUserId',
              'modifyUserName',
            ]),
            ...pick(item, ['id', 'key', 'name', 'type']),
            column: item.originFieldKey,
            enabled: 1,
            modelKey: modelKey,
            columnType: null,
            createType: 'SYSTEM',
            description: null,
            bindInfo: null,
            refModelType: null,
            sortNum: index,
            masterFieldKey: null,
          };
        }),
      };
    }
  } else if (typeof APIS.getViewJsFieldList === 'function') {
    const res = await APIS.getViewJsFieldList({});

    if (res) {
      const subFieldList = res.filter((item) => item.type === FIELD_TYPE.MASTERSLAVE);

      modelMetaMap.value[modelKey] = {
        meta: masterModel.value.key ? { ...masterModel.value } : { key: res.key, name: res.name },
        fields: (res ?? []).map((item, index) => {
          const obj = {};
          if (item.type === FIELD_TYPE.MASTERSLAVE) {
            Object.assign(obj, {
              type: item.type,
              bindInfo: item.key, // 用字段key模拟模型key
            });
          } else if (item.type === FIELD_TYPE.IMAGE) {
            Object.assign(obj, {
              type: FIELD_TYPE.IMAGE,
            });
          } else {
            Object.assign(obj, {
              type: FIELD_TYPE.TEXT,
            });
          }
          return {
            id: `${modelKey}$${item.key}`,
            key: item.key,
            name: item.name,
            createType: CreateType.USER_DEFINED,
            enabled: 1,
            required: 0,
            modelKey: modelKey,
            columnType: null,
            description: null,
            refModelType: null,
            sortNum: index,
            masterFieldKey: null,
            ...obj,
          };
        }),
      };

      subFieldList.forEach((m) => {
        if (!modelMetaMap.value[m.key!]) {
          modelMetaMap.value[m.key!] = {
            meta: { key: m.key, name: m.name, subModel: 1 },
            fields: (m.children ?? []).map((aa, ii) => {
              return {
                id: `${m.key}$${aa.key}`,
                key: aa.key,
                name: aa.name,
                type: aa.type === FIELD_TYPE.IMAGE ? FIELD_TYPE.IMAGE : FIELD_TYPE.TEXT,
                createType: CreateType.USER_DEFINED,
                enabled: 1,
                required: 0,
                modelKey: m.key,
                columnType: null,
                description: null,
                bindInfo: null,
                refModelType: null,
                sortNum: ii,
                masterFieldKey: null,
              };
            }),
          };
        }
      });
    }
  }
}

/** 获取模型详细 */
async function getModelInfo(key: string) {
  if (key === LOCAL_FORM_MODEL_KEY) {
    return getLocalDesignerModelInfo() as ModelMetaResponse;
  }
  if (!modelInfoMap.value[key]) {
    modelInfoMap.value[key] = { key, name: modelMetaMap.value[key]?.meta.name || '' };
  }
  return modelInfoMap.value[key];
}

async function refreshModelFields(key) {
  // 先清空数据
  modelMetaMap.value[key] = undefined;
  if (key === masterModel.value.key) {
    await _loadModelFieldsByKey();
  } else {
    await _loadDynamicTableModelsFields();
  }
}

export function useModelFields() {
  function resetModelFields() {
    masterModel.value = {};
    modelMetaMap.value = {};
    modelInfoMap.value = {};
  }

  function initApis(customApis?: Partial<IAPIS>) {
    APIS = {
      ...Default_Apis,
      ...(customApis || {}),
    };
  }

  async function initMasterModel(options, apis: Partial<IAPIS> = {}) {
    resetModelFields();

    initApis(apis);
    Object.assign(masterModel.value, options);

    try {
      await Promise.all([
        _loadModelFieldsByKey(),
        _loadDynamicTableModelsFields(),
        _loadViewModelFieldsByKey(),
      ]);
    } catch (error) {
      console.error('出错了', error);
    }

    console.log('modelMetaMap', modelMetaMap.value);
  }

  return {
    masterModel,
    modelMetaMap,
    fieldMetaMap,
    extraLib,
    getFieldMeta,
    initMasterModel,
    subTableFieldModel,
    getModelInfo,
    refreshModelFields,
  };
}

/** 是否是预置字段，包括系统字段和业务内置字段 */
export function isPresetField(field: FieldMetaDTO) {
  return [CreateType.BUILTIN, CreateType.SYSTEM].includes(field.createType as any);
}
