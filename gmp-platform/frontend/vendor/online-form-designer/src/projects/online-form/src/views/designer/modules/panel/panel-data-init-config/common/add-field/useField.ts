import { ref } from 'vue';
import { omit } from 'lodash-es';
import { FIELD_TYPE, CreateType } from '/@/enums/appEnum';
import { FormTypeEnum, ViewTypeEnum, JoinModelTypeEum } from '@gct/nocode-base';
import { getOnlineFormTmplGetVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';

import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import { getViewModelInfo } from '/@/apis/gct-apaas/ViewModelController';
import { getSqlViewModelInfo } from '/@/apis/gct-apaas/SqlViewModelController';
import { getJsEngineExecByKey } from '/@/apis/gct-apaas/JsEngineController';

type IJoinModelMetaMap = Record<
  string,
  {
    meta: {
      key?: string;
      name?: string;
    };
    fields: Array<{
      key?: string;
      fieldKey?: string;
      fieldName?: string;
      fieldType?: FIELD_TYPE | string;
      bindInfo?: string;
      modelKey?: string;
      createType?: CreateType;
    }>;
  }
>;

const joinModelMetaMap = ref<IJoinModelMetaMap>({});
const pendingRequests = new Map();

export function useField() {
  const FIELD_TYPE_EXCLUDED = [
    // FIELD_TYPE.ASSOCIATED_PRIMARY_KEY,
    FIELD_TYPE.SERIAL,
    FIELD_TYPE.MASTERSLAVE,
    FIELD_TYPE.ESOP,
    FIELD_TYPE.AGG,
    FIELD_TYPE.EXPRESSION,
    FIELD_TYPE.EXPRESSION_CONDITION,
    FIELD_TYPE.TRANSACTION,
    FIELD_TYPE.LABEL_TEMPLATE,
    FIELD_TYPE.LABEL_TEMPLATE_REF,
    FIELD_TYPE.DOCUMENT_TEMPLATE,
    FIELD_TYPE.SERIALRULE,
    FIELD_TYPE.PRINTER,
    FIELD_TYPE.MESSAGE_TMPL,
    FIELD_TYPE.RANGE_USER,
    FIELD_TYPE.ONLINE_FORM_TEMPLATE,
    FIELD_TYPE.E_DHR_TEMPLATE,
    // FIELD_TYPE.ONLINE_FORM,
    FIELD_TYPE.READONLYCMP,
    FIELD_TYPE.Biz_Process,
  ];

  const filterFieldInfo = (item) => {
    // Tapd-1022972【排除未使用的内置自定义字段】
    if (item?.specificConfig?.extField && !item?.specificConfig?.extUsed) return false;

    return !FIELD_TYPE_EXCLUDED.includes(item.type);
  };

  const _checkRefModel = (item) =>
    item.bindInfo &&
    [FIELD_TYPE.REF, FIELD_TYPE.RDO_REF].includes(item.type) &&
    [CreateType.USER_DEFINED, CreateType.BUILTIN].includes(item.createType);

  const getFieldItem = (info) =>
    (info.fieldMetaList ?? []).filter(filterFieldInfo).map((item) => ({
      key: item.key,
      fieldKey: item.key,
      fieldName: item.name,
      fieldType: item.type,
      modelKey: info.key,
      bindInfo: item.bindInfo,
      createType: item.createType,
    }));

  const fetchAndCache = async (key, fetchFn) => {
    // if (joinModelMetaMap.value[key]) return joinModelMetaMap.value[key];

    if (pendingRequests.has(key)) {
      // 如果已有请求在进行中，等待请求完成后返回
      return await pendingRequests.get(key);
    }

    const fetchPromise = fetchFn()
      .then((data) => {
        if (data) {
          joinModelMetaMap.value[key] = data;
        }
        return data;
      })
      .finally(() => {
        pendingRequests.delete(key); // 请求完成后移除状态
      });

    pendingRequests.set(key, fetchPromise); // 添加到请求状态
    return fetchPromise;
  };

  const getRefInfo = async (item) => {
    const info = await getModelMetaDetail({ modelKey: item.bindInfo });
    if (info) {
      return {
        meta: { key: info.key, name: info.name, subModel: info.subModel },
        fields: getFieldItem(info),
        children: info.fieldMetaList?.filter(_checkRefModel),
      };
    }
  };

  const _getTwoLevelRefConfig = async (item) => {
    const info = await getRefInfo(item);
    return info ? { meta: info.meta, fields: info.fields } : null;
  };

  const _getOneLevelRefConfig = async (item) => {
    const info = await getRefInfo(item);
    if (info) {
      const childRefList = await Promise.all((info.children ?? []).map(_getTwoLevelRefConfig));
      return [omit(info, 'children'), ...childRefList.filter(Boolean)];
    }
    return [];
  };

  const _loadModelFieldsByKey = async (modelKey) =>
    fetchAndCache(modelKey, async () => {
      const result = await getModelMetaDetail({ modelKey });
      if (result) {
        const refList = await Promise.all(
          (result.fieldMetaList ?? []).filter(_checkRefModel).map(_getOneLevelRefConfig),
        );

        refList.flat().forEach((item) => {
          if (!joinModelMetaMap.value[item!.meta.key!]) {
            joinModelMetaMap.value[item!.meta.key!] = item;
          }
        });

        return {
          meta: { key: result.key, name: result.name },
          fields: getFieldItem(result),
        };
      }
    });

  async function _loadSqlViewFieldByKey(modelKey) {
    const result = await getSqlViewModelInfo({
      modelKey,
    });

    if (result) {
      return (result.fieldConfig ?? [])
        .filter((item) => Boolean(item.enabled))
        .map((item) => {
          return {
            key: item.key!,
            fieldKey: item.key!,
            fieldName: item.name!,
            fieldType: item.type!,
            modelKey: modelKey!,
            bindInfo: undefined,
            createType: CreateType.USER_DEFINED,
          };
        });
    }
  }

  async function _loadViewModelFieldsByKey(modelKey) {
    const result = await getViewModelInfo({
      id: modelKey,
    });

    if (result) {
      return (result.fieldConfig?.fields ?? []).map((item, index) => {
        return {
          key: item.key!,
          fieldKey: item.key!,
          fieldName: item.name!,
          fieldType: item.type!,
          modelKey: modelKey!,
          bindInfo: undefined,
          createType: CreateType.USER_DEFINED,
        };
      });
    }
  }

  async function _loadViewJsFieldByKey(modelKey, bindKey, query) {
    const result: any = await getJsEngineExecByKey({ key: bindKey }, query);

    if (result) {
      return (result ?? []).map((item, index) => {
        return {
          key: item.key!,
          fieldKey: item.key!,
          fieldName: item.name!,
          fieldType: FIELD_TYPE.TEXT,
          modelKey: modelKey!,
          bindInfo: undefined,
          createType: CreateType.USER_DEFINED,
        };
      });
    }
  }

  const loadViewFieldByType = async (modelKey, type, bindKey, query) => {
    const loaders = {
      [ViewTypeEnum.VIEW_SQL]: _loadSqlViewFieldByKey,
      [ViewTypeEnum.VIEW_MODEL]: _loadViewModelFieldsByKey,
      [ViewTypeEnum.VIEW_JS]: async () => _loadViewJsFieldByKey(modelKey, bindKey, query),
    };
    return loaders[type] ? loaders[type](modelKey) : [];
  };

  const initData = async (modelKey, { joinModelType, joinFormRefId }) => {
    // if (joinModelMetaMap.value[modelKey]) return;

    if (joinModelType === JoinModelTypeEum.FormModel) {
      const res = await getOnlineFormTmplGetVersionById({ id: joinFormRefId });
      if (res?.formType === FormTypeEnum.VIEW) {
        const fieldList = await loadViewFieldByType(modelKey, res.viewType, res.bindKey, {});
        joinModelMetaMap.value[modelKey] = {
          meta: { key: res.modelKey, name: res.modelName },
          fields: fieldList ?? [],
        };
        return;
      }
    }

    await _loadModelFieldsByKey(modelKey);
  };

  return {
    joinModelMetaMap,
    initData,
  };
}
