import { ref, toRaw, reactive, watch, toRefs } from 'vue';
import { FIELD_TYPE, CreateType } from '/@/enums/appEnum';
import type { FieldMetaDTO } from '/@/apis/gct-apaas/model';
import { has, pick, cloneDeep } from 'lodash-es';
import { getModelMetaDetail, getModelMetaByKeys } from '/@/apis/gct-apaas/ModelMetaController';
import { SCOPEINFO } from '../utils/enum';

interface OBJINFO {
  /** 模型key */
  modelKey: string;
  /** 链路对象字符串 */
  fieldCodeChain: string;
  /** 所绑定的表单 key */
  bindFormId: string;
  /** 是否是字段模型 */
  isFieldModel: boolean;
  /** 关联字段数组 */
  relateObjList: Array<{
    /** 字段key */
    fieldKey: string;
    /** 字段类型 */
    fieldType: FIELD_TYPE;
    /** 字段所属模型 key */
    belongModelKey: string;
    /** 字段绑定的关联模型 key */
    bindModelKey: string;
    /** 所绑定的表单 key */
    bindFormId: string;
    /** 链路对象字符串 */
    fieldCodeChain: string;
    /** 是否是字段模型 */
    isFieldModel: boolean;
    modelLink: string[];
    children: any;
  }>;
}

interface ModelInfoMap {
  [k: string]: {
    /** 模型 id */
    modelId: string;
    /** 模型 key */
    modelKey: string;
    /** 模型名称 */
    modelName: string;
    /** 模型类型 */
    modelType: string;
  };
}

export interface ISelectObj {
  modelName: string;
  fieldList: FieldMetaDTO[];
  modelKey: string;
  currentFormId: string;
  fieldCodeChain: string;
  isFieldModel: boolean;
}
const objInfo: OBJINFO = {
  modelKey: '',
  fieldCodeChain: '',
  bindFormId: '',
  isFieldModel: false,
  relateObjList: [],
};
/** 实体模型信息 map */
const modelInfoMap: ModelInfoMap = {};
/** 模型下的字段列表 */
const modelFieldMap = {};
const selectObj: ISelectObj = {
  modelName: '',
  fieldList: [],
  modelKey: '',
  currentFormId: '',
  fieldCodeChain: '',
  isFieldModel: false,
};

const fieldCascaderSelectValue: string[] = [];
/**字段链路临时缓存 */
const fieldPathChainList: string[] = [];
const fieldMap = {
  objInfo,
  modelInfoMap,
  modelFieldMap,
  fieldCascaderSelectValue,
  fieldPathChainList,
};
const fieldCacheMap = {
  [SCOPEINFO.FIELD_FORM]: {
    selectObj: reactive(cloneDeep(selectObj)),
    ...toRefs(reactive(cloneDeep(fieldMap))),
  },
  [SCOPEINFO.FIELD_LIST]: {
    selectObj: reactive(cloneDeep(selectObj)),
    ...toRefs(reactive(cloneDeep(fieldMap))),
  },
};

export function useModelField(scope: SCOPEINFO = SCOPEINFO.FIELD_FORM) {
  const {
    objInfo,
    modelInfoMap,
    modelFieldMap,
    selectObj,
    fieldCascaderSelectValue,
    fieldPathChainList,
  } = fieldCacheMap[scope];
  /** 根据模型 key 获取模型信息和字段列表 */
  async function getModelDetail2FieldList(modelKey: string) {
    const res = await getModelMetaDetail({
      modelKey,
    });
    return res;
  }

  function setModelFieldToMap(modelKey: string, fieldList: any[] = []) {
    // 模型下的字段列表
    if (!modelFieldMap.value[modelKey]) {
      modelFieldMap.value[modelKey] = fieldList?.reduce(
        (prev, curr) => ({
          ...prev,
          [curr.key ?? '']: curr,
        }),
        {},
      );
    }
  }

  function setModelInfoToMap(modelList: any = []) {
    modelList?.forEach((item) => {
      if (!modelInfoMap.value[item.key!]) {
        // 模型详情信息 map
        modelInfoMap.value[item.key!] = {
          modelId: item.id!,
          modelKey: item.key!,
          modelName: item.name!,
          // NDO | RDO
          modelType: item.type!,
        };
      }
    });
  }

  /** 获取字段列表 */
  function getModelFieldList(modelKey: string): FieldMetaDTO[] {
    if (!modelKey || !modelFieldMap.value[modelKey]) {
      return [];
    }
    return Object.values(toRaw(modelFieldMap.value[modelKey]));
  }

  /** 获取字段信息 */
  function getModelFieldInfo(modelKey: string, fieldKey: string) {
    if (!modelKey || !fieldKey || !modelFieldMap.value[modelKey]) {
      return;
    }
    return modelFieldMap.value[modelKey][fieldKey];
  }

  function getModelInfo(modelKey: string) {
    if (!modelKey || !modelInfoMap.value[modelKey]) {
      return false;
    }
    return modelInfoMap.value[modelKey];
  }

  /**验证需要追踪的关联引用模型 */
  function _checkRefModel(item, fieldTypes: FIELD_TYPE[] = []) {
    return (
      item.bindInfo &&
      [FIELD_TYPE.REF, FIELD_TYPE.RDO_REF, ...fieldTypes].includes(item.type) &&
      [CreateType.USER_DEFINED, CreateType.BUILTIN].includes(item.createType as CreateType)
    );
  }

  function getRefConfig({ item, formId }, { links, fieldLinks, fieldType }) {
    const link = [...links, item.bindInfo];
    return {
      fieldKey: item.key!,
      fieldType: item.type,
      belongModelKey: item.modelKey!,
      bindModelKey: item.bindInfo,
      bindFormId: formId ?? '',
      isFieldModel: true,
      // ! 这边用对象的原因是模型 key 可能是特殊字符，所以如果直接用字符串拼接可能会有问题
      fieldCodeChain: JSON.stringify({
        // 关联模型的字段key
        bindFieldKey: item.key,
        // 字段所属模型的key
        bindModelKey: item.bindInfo,
        // 关联模型字段所属模型的key
        belongModelKey: item.modelKey,
        /**模型链路 */
        modelLink: link,
        /**字段链路 */
        fieldLink: fieldLinks,
        /**关联源模型的模型类型 */
        refOriginFieldType: fieldType,
      }),
      modelLink: link,
      children: [],
    };
  }

  async function getRefInfo({ item, formId }, { modelKey, fieldType }) {
    const oneLevelRefConfig = getRefConfig(
      { item, formId },
      { links: [modelKey], fieldLinks: [item.key], fieldType },
    );
    const twoLevelFieldData = await getModelDetail2FieldList(oneLevelRefConfig.bindModelKey);
    const twoLevelRefConfigs = twoLevelFieldData?.fieldMetaList
      ?.filter((a) => _checkRefModel(a))
      .map((i) =>
        getRefConfig(
          { item: i, formId },
          { links: oneLevelRefConfig.modelLink, fieldLinks: [item.key, i.key], fieldType },
        ),
      );
    return { ...oneLevelRefConfig, children: twoLevelRefConfigs };
  }

  async function loadObjInfo(
    modelKey: string,
    {
      formId,
      childParentModelKey,
      isShowCascader = true,
    }: { formId?: string; childParentModelKey?: string; isShowCascader?: boolean } = {},
  ) {
    const info = await getModelDetail2FieldList(modelKey);

    if (info) {
      info.fieldMetaList?.forEach((item) => {
        if (item.type === FIELD_TYPE.ASSOCIATED_PRIMARY_KEY && childParentModelKey) {
          item.bindInfo = childParentModelKey;
        }
      });

      const refList = await Promise.all(
        info.fieldMetaList
          ?.filter((a) => _checkRefModel(a, [FIELD_TYPE.ASSOCIATED_PRIMARY_KEY]))
          ?.map((item) => getRefInfo({ item, formId }, { modelKey, fieldType: item.type })) ?? [],
      );

      objInfo.value = {
        modelKey: info.key!,
        fieldCodeChain: JSON.stringify({ modelKey: info.key }),
        bindFormId: formId ?? '',
        isFieldModel: false,
        relateObjList: refList,
      };

      // 模型下的字段列表
      setModelFieldToMap(info.key ?? '', info.fieldMetaList);

      let modelDetails = [info];

      const allRefList = [
        ...new Set(
          objInfo.value.relateObjList
            ?.map((item) => [item, ...(item.children || [])])
            .flat()
            .map((item) => item.bindModelKey),
        ),
      ];

      if (allRefList?.length !== 0) {
        const res = await getModelMetaByKeys({ modelKeys: allRefList.join(',') ?? '' });
        modelDetails = modelDetails?.concat(res ?? []);
      }

      setModelInfoToMap(modelDetails);

      if (allRefList?.length !== 0 && isShowCascader) {
        await Promise.all(allRefList.map((k) => getModelDetail2FieldList(k))).then((res) => {
          (res ?? []).forEach((info) => {
            if (info) {
              // 模型下的字段列表
              setModelFieldToMap(info.key ?? '', info.fieldMetaList);
            }
          });
        });
      }
    }
    return true;
  }

  async function fetchDetailList(modelKey: string) {
    if (!modelFieldMap.value[modelKey as string]) {
      const info = await getModelDetail2FieldList(modelKey);
      if (info) {
        setModelFieldToMap(info.key ?? '', info.fieldMetaList);
      }
    }
  }

  function setSelectObjData(modelKey, info) {
    const modelInfo = getModelInfo(modelKey);
    if (modelInfo) {
      selectObj.modelKey = modelInfo.modelKey!;
      selectObj.modelName = modelInfo.modelName!;
      selectObj.currentFormId = info.bindFormId;
      selectObj.fieldCodeChain = info.fieldCodeChain;
      selectObj.isFieldModel = info.isFieldModel;
      selectObj.fieldList = getModelFieldList(modelInfo.modelKey!);
    }
  }

  watch(
    [() => objInfo.value, () => modelInfoMap.value],
    () => {
      if (!selectObj.modelKey && objInfo.value.modelKey) {
        setSelectObjData(objInfo.value.modelKey, objInfo.value);
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  function changeSelectInfo(modelKey: string, data) {
    setSelectObjData(modelKey, data);
  }

  function clearSelectInfo() {
    selectObj.modelKey = '';
    selectObj.modelName = '';
    selectObj.currentFormId = '';
    selectObj.fieldCodeChain = '';
    selectObj.isFieldModel = false;
    selectObj.fieldList = [];
    fieldCascaderSelectValue.value = [];
  }

  function clearObjInfo() {
    objInfo.value = {
      modelKey: '',
      fieldCodeChain: '',
      bindFormId: '',
      isFieldModel: false,
      relateObjList: [],
    };
  }

  function getFieldCodeChainStr(fieldCodeChain: string, currentFieldName?: string) {
    if (!fieldCodeChain) {
      return '';
    }

    const fieldCodeChainObj = JSON.parse(fieldCodeChain);
    if (has(fieldCodeChainObj, 'bindFieldKey')) {
      const fieldInfo = getModelFieldInfo(
        fieldCodeChainObj.belongModelKey,
        fieldCodeChainObj.bindFieldKey,
      );
      const bindModelInfo = getModelInfo(fieldCodeChainObj.bindModelKey);
      if (fieldInfo && bindModelInfo) {
        return `${fieldInfo.name}(${bindModelInfo.modelName})${
          currentFieldName ? ` > ${currentFieldName}` : ''
        }`;
      }
    } else {
      const modelInfo = getModelInfo(fieldCodeChainObj.modelKey);
      if (modelInfo) {
        return `${modelInfo.modelName}${currentFieldName ? ` > ${currentFieldName}` : ''}`;
      }
    }

    return '';
  }

  /**获取字段链路 */
  async function getFieldPathChainList(fieldCodeChain: string, fieldName: string) {
    if (!fieldCodeChain) {
      fieldPathChainList.value = [];
    } else {
      const fieldCodeChainObj = JSON.parse(fieldCodeChain);
      const isFieldModel = has(fieldCodeChainObj, 'bindFieldKey');
      const modelKeys = isFieldModel
        ? fieldCodeChainObj.modelLink || [
            fieldCodeChainObj.belongModelKey,
            fieldCodeChainObj.bindModelKey,
          ]
        : [fieldCodeChainObj.modelKey];
      // 如果不存在则需要查询接口
      if (modelKeys.some((item: string) => !getModelInfo(item))) {
        const res = await getModelMetaByKeys({
          modelKeys: modelKeys.join(','),
        });
        if (res) {
          setModelInfoToMap(res);
        }
      }
      if (isFieldModel) {
        fieldPathChainList.value = modelKeys
          .map((i) => getModelInfo(i).modelName)
          .concat(fieldName);
      } else {
        const modelInfo = getModelInfo(fieldCodeChainObj.modelKey);
        if (modelInfo) {
          fieldPathChainList.value = [modelInfo.modelName, fieldName];
        }
      }
    }

    return fieldPathChainList.value;
  }

  async function reloadFieldToolkit(modelKey, formId, childParentModelKey) {
    if (selectObj.currentFormId === formId) {
      return;
    }
    clearSelectInfo();
    clearObjInfo();

    await loadObjInfo(modelKey, {
      formId: formId,
      childParentModelKey: childParentModelKey,
    });
  }

  return {
    objInfo,
    loadObjInfo,
    getModelInfo,
    getModelFieldList,
    getModelFieldInfo,
    selectObj,
    modelFieldMap,
    fetchDetailList,
    changeSelectInfo,
    getFieldCodeChainStr,
    getFieldPathChainList,
    clearSelectInfo,
    clearObjInfo,
    fieldCascaderSelectValue,
    fieldPathChainList,
    reloadFieldToolkit,
  };
}
