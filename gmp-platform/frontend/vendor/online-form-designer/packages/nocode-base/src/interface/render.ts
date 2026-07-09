import { isNil, pick } from 'lodash-es';
import dayjs from 'dayjs';
import { FIELD_TYPE, EntityModelCategoryEnum, RecordNoGenerateEnum } from '@gct/runtime';
import {
  ComponentTypeEnum,
  PaperWidgeType,
  PaperWidgeValueType,
  CellType,
  FieldSysVarDefaultValueEnum,
  DateFormat,
  PlatformEnum,
  FormTypeEnum,
  SignatureTypeEnum,
  SignatureTimeTypeEnum,
  SignatureNumberTypeEnum,
  CellWidgetViewState,
} from '../constant';
import { transformUtils } from './transform';
import { refUtils } from './ref';
import {
  getDesignerCommonGetCanBeUsedOrg,
  getDesignerCommonGetCanBeUsedOrgUser,
} from '/@/apis/gct-apaas/DesignerCommonController';
import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
import {
  postModelComprehensiveQueryRefChainDataByModelCategory,
  getModelComprehensiveEnumInfoByModelCategory,
  getModelComprehensiveModelDetailListByKeysByModelCategory,
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { FormTmplBomController } from '../hooks';

type RequestFn<TParams, TResult> = (params: TParams) => Promise<TResult>;

interface CacheEntry<TResult> {
  data: TResult;
  expireAt: number;
}

const requestUtils = {
  pendingMap: new Map<string, Promise<any>>(),
  cacheMap: new Map<string, CacheEntry<any>>(),
  defaultTTL: 2 * 60 * 1000, // 默认缓存有效期 2分钟
  /** 生成唯一 key */
  getKey(url: string, params: any): string {
    return `${url}_${JSON.stringify(params)}`;
  },
  /**
   * 处理带缓存与去重的请求
   * @param url 唯一逻辑标识（非实际 API 地址）
   * @param params 请求参数
   * @param requestFn 实际请求函数
   * @param ttl 可选，缓存有效期（毫秒）
   */
  async handleRequest<TParams, TResult>(
    url: string,
    params: TParams,
    requestFn: RequestFn<TParams, TResult>,
    ttl?: number,
  ): Promise<TResult> {
    const key = this.getKey(url, params);
    const now = Date.now();
    const cacheTTL = ttl ?? this.defaultTTL;

    // 每次访问时顺带懒清理过期缓存
    this.cleanupExpiredCache();

    // 命中缓存且未过期
    const cached = this.cacheMap.get(key);
    if (cached && cached.expireAt > now) {
      console.info(`[cache] 命中缓存: ${key}`);
      return cached.data;
    } else if (cached) {
      // 过期缓存清理
      this.cacheMap.delete(key);
    }

    // 已有相同请求在 pending 中
    if (this.pendingMap.has(key)) {
      console.warn(`[pending] 返回进行中的 Promise: ${key}`);
      return this.pendingMap.get(key)!;
    }

    // 触发真实请求
    const reqPromise = requestFn(params)
      .then((res) => {
        this.cacheMap.set(key, {
          data: res,
          expireAt: Date.now() + cacheTTL,
        });
        return res;
      })
      .finally(() => {
        this.pendingMap.delete(key);
      });

    this.pendingMap.set(key, reqPromise);
    return reqPromise;
  },

  /** 清空全部缓存 */
  clearCache() {
    this.cacheMap.clear();
  },

  /** 清空 pending 状态 */
  clearPending() {
    this.pendingMap.clear();
  },

  /** 定期清理过期缓存 */
  cleanupExpiredCache() {
    const now = Date.now();
    let count = 0;
    for (const [key, entry] of this.cacheMap.entries()) {
      if (entry.expireAt <= now) {
        this.cacheMap.delete(key);
        count++;
      }
    }
    if (count > 0) {
      console.debug(`[cache] 清理过期缓存 ${count} 项`);
    }
  },
};

async function getDeptList() {
  const data = (await getDesignerCommonGetCanBeUsedOrg()) || [];
  data?.forEach((i) => {
    const isRoot = !data.find((o) => o.id === i.parentId);
    isRoot && (i.parentId = 'ROOT');
  });
  const labelList =
    data?.map((i) => {
      return { label: i.name!, value: i.id!, _item: i };
    }) || [];

  return {
    options: labelList,
  };
}

async function getEnumList(modelKey, fieldKey) {
  const data = await getModelComprehensiveEnumInfoByModelCategory(
    { modelCategory: 'entity' },
    {
      modelKey,
      fieldKey,
    },
  );
  const valueList =
    data?.map((i) => {
      return { label: i.text!, value: i.value!, _item: i };
    }) || [];

  return {
    options: valueList,
  };
}

async function getUserList(modelKey, fieldKey) {
  const result = await requestUtils.handleRequest(
    '/api/getUserList',
    { modelKey, fieldKey, pageSize: 999 },
    getDesignerCommonGetCanBeUsedOrgUser,
  );

  const { data = [] } = result || {};
  const valueList = data?.map((i) => {
    return { label: i.__LABEL__!, value: i.id!, _item: i };
  });
  return {
    options: valueList,
  };
}

async function getRefList({
  modelKey,
  fieldKey,
  refModelKey,
  queryData = {},
  exp = '',
  pageNo = 1,
  pageSize = 100,
  isRdo,
  needDataLink = false,
  isLinkQuery = false,
  rmIfNoDefaultVersion = 0,
  ...otherParams
}) {
  // 数据联动不需要初始化 options
  if (needDataLink) {
    return {
      options: [],
      finished: true,
      totalCount: 0,
    };
  }

  const url = '/api/getRefList'; // 可自定义唯一标识

  const params = {
    modelKey,
    fieldKey,
    refModelKey,
    queryData,
    exp,
    pageNo,
    pageSize,
    isRdo,
    isLinkQuery,
    needDataLink,
    rmIfNoDefaultVersion,
    ...otherParams,
  };

  return requestUtils.handleRequest(url, params, async (props) => {
    const {
      modelKey,
      fieldKey,
      refModelKey,
      queryData,
      exp,
      pageNo,
      pageSize,
      isRdo,
      isLinkQuery,
      rmIfNoDefaultVersion,
      ...otherParams
    } = props;

    let res: any;

    if (isLinkQuery) {
      // 数据联动专属接口
      res =
        (await postModelComprehensiveQueryRefChainDataByModelCategory(
          { modelCategory: EntityModelCategoryEnum.ENTITY },
          {
            ...otherParams,
            fieldKey,
            modelKey,
            pageSize,
            pageNo,
          },
        )) || {};
    } else {
      // 普通接口
      res =
        (await postModelDataQueryRefData({
          fieldKey,
          modelKey,
          pageSize,
          pageNo,
          refModelKey,
          query: { ...queryData },
          rmIfNoDefaultVersion,
          exp,
        })) || {};
    }

    const { data = [], totalPage, dict, totalCount } = res || {};

    return {
      options: isRdo
        ? transformUtils.transformSourceData2SubTable(data || [], dict)
        : (data || []).map((i: any) => ({
            disabled: !!i.deleted_,
            label: i.__LABEL__,
            value: i.id_ || i.id,
            _item: i,
          })),
      finished: totalPage && totalPage === 1,
      totalCount,
    };
  });
}

async function getLot2SnList({
  queryData = {},
  pageNo = 1,
  pageSize = 20,
  // isMaterialConsumeField = false,
}) {
  const url = '/api/lot2SnList'; // 可自定义唯一标识
  const params = { queryData, pageNo, pageSize };

  return requestUtils.handleRequest(url, params, async (props) => {
    const params = {
      modelCategory: EntityModelCategoryEnum.ENTITY,
      modelKey: 'em_production_identification',
      bsKey: 'biz_get_production_identification_by_product',
    };
    const queryParams = {
      // 'instance_status_.ne': 'ARCHIVED',
      ...props.queryData,
    } as any;

    // 删除多余的查询算子
    // delete queryParams['instance_status_.ne'];

    // 模糊匹配字段改成name_
    const keyword = queryParams['material_no_.like'];
    if (keyword) {
      delete queryParams['material_no_.like'];
      queryParams['name_.like'] = keyword;
    }

    const res: any = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      params,
      {
        query: queryParams,
        pageSize: props.pageSize,
        pageNo: props.pageNo,
      },
    );

    const { data = [], totalPage, dict, totalCount } = res || {};

    return {
      options: transformUtils.transformSourceData2SubTable(data || [], dict),
      finished: totalPage && totalPage === 1,
      totalCount,
    };
  });
}

const processWidgets = async (dataCenter, callback: Function, tdCallback?: Function) => {
  const DEFAULT_ATTRS = { fieldAttr: 'field', modelAttr: 'modelKey', needDyn: true };

  // 处理引用字段的辅助函数
  const processRefFields = async (fields, key, tdWidget) => {
    if (!fields || !fields.length) return;
    for (const field of fields) {
      await callback(field.props, { ...DEFAULT_ATTRS, isRef: true, key }, tdWidget);
    }
  };

  // 通用逻辑处理函数
  const processCellWidget = async (cellWidget, tdWidget) => {
    if (!cellWidget || !cellWidget.props) return;

    await callback(cellWidget.props, DEFAULT_ATTRS, tdWidget, cellWidget.component);

    const field = cellWidget.props.fieldLink;

    if (cellWidget.component === ComponentTypeEnum.Switch) {
      await processRefFields(cellWidget.props.falseRefFields, `${field}.false`, tdWidget);
      await processRefFields(cellWidget.props.trueRefFields, `${field}.true`, tdWidget);
    } else if (cellWidget.component === ComponentTypeEnum.EnumSelect) {
      const options =
        cellWidget.props?.newSpecificConfig?.newOptions ??
        JSON.parse(cellWidget.props.optionsJson ?? '[]');

      for (const option of options) {
        await processRefFields(option.refFields, `${field}.${option.value}`, tdWidget);
      }
    }
  };

  // 处理常规组件逻辑
  const processWidget = async (widget) => {
    const { component, props } = widget.cellWidget;

    // 条形码或二维码组件处理
    if (
      [PaperWidgeType.Barcode, PaperWidgeType.Qrcode].includes(component) &&
      props.valueType === PaperWidgeValueType.Field
    ) {
      await callback(props, { fieldAttr: 'value', modelAttr: 'modelKey' });
    }
    // 对角线组件处理
    else if (component === PaperWidgeType.Diagonal) {
      const bindFields = props.bindFields ?? [];
      for (const field of bindFields) {
        await callback(field, { fieldAttr: 'field', modelAttr: 'model' });
      }
    }
    // 幂组件处理
    else if (component === PaperWidgeType.Power) {
      for (const key of ['baseValueField', 'exponentValueField', 'valueField']) {
        await callback(props[key], { fieldAttr: 'field', modelAttr: 'model' });
      }
    }
    // 时间差组件处理
    else if (component === PaperWidgeType.TimeDiff) {
      for (const key of ['startField', 'endField']) {
        await callback(props[key], { fieldAttr: 'field', modelAttr: 'model' });
      }
    }
  };

  for (const widget of Object.values(dataCenter) as any) {
    if (widget.component === ComponentTypeEnum.PAPER) {
      for (const key of ['headerWidgets', 'footerWidgets']) {
        for (const item of widget[key] || []) {
          if (
            [PaperWidgeType.Text, PaperWidgeType.Barcode, PaperWidgeType.Qrcode].includes(
              item.type,
            ) &&
            item.valueType === PaperWidgeValueType.Field
          ) {
            await callback(item, { fieldAttr: 'value', modelAttr: 'modelKey' });
          }
        }
      }
    } else {
      const { cellWidget, cellValueType } = widget;
      if (!cellWidget) {
        continue;
      }
      if (cellValueType === CellType.Field) {
        if (cellWidget.component === ComponentTypeEnum.CombineFields) {
          for (const field of cellWidget.props.fields) {
            await processCellWidget(field, widget);
          }
        } else {
          await processCellWidget(cellWidget, widget);
        }

        await tdCallback?.(widget);
      } else if (cellValueType === CellType.Widget) {
        await processWidget(widget);
      }
    }
  }
};

/** 渲染端公共类 */
export const renderUtils = {
  getValue: (modelValue, multiple) => {
    const value = modelValue || undefined;
    if (multiple) {
      return Array.isArray(value) ? value : value?.split(',').filter(Boolean) || [];
    }
    return value;
  },
  setValue: (value, multiple, key?: string) => {
    return multiple ? value?.map((item) => (key ? item[key] : item)).join(',') : value || '';
  },
  getSelectOptions: (payload) => {
    const { value, multiple, options, key } = payload || {};

    const selectValues = (
      Array.isArray(value) ? value : multiple ? (value?.split(',') ?? []) : [value]
    ).filter(Boolean);

    const selectOptions = options.filter((item) => selectValues.includes(item.value));

    const labels = selectOptions.map((item) => item[key]) ?? [];
    return {
      selectOptions,
      labels,
      labelJson: labels?.join(','),
    };
  },

  getRdoSelectOptions: (payload) => {
    const { value, treeData, key, versionKey } = payload || {};

    const [_fId, _cId] = (value ?? '')?.split(':');
    const selectInfo = treeData.filter((item) => item.value === _fId) ?? [];
    if (!_cId) {
      const labels = selectInfo.map((item) => item[key]);
      return {
        labels,
        labelJson: labels?.join(','),
      };
    }

    const selectChildInfo = selectInfo
      .map((fItem) => {
        return fItem.children.filter((cItem) => cItem.value === value) ?? [];
      })
      .flat();

    const labels = selectChildInfo.map((item) => `${item[key]}:${item[versionKey]}`);

    return {
      labels,
      labelJson: labels?.join(','),
    };
  },

  getLabJsonValue: (formData, field) => {
    const parsedValue = formData?.[`${field}_lb_`];
    let label;
    try {
      // 尝试解析为 JSON
      label = JSON.parse(parsedValue);
    } catch (error) {
      // 如果解析失败，说明是普通字符串
      label = parsedValue;
    }

    return Array.isArray(label) ? label.join(',') : label;
  },
  getBoolValue: (value) => {
    // 空值
    if (isNil(value)) {
      return null;
    }
    if (value === 'true' || value === 'false') {
      return JSON.parse(value);
    }
    if (isNaN(parseInt(value))) {
      return Boolean(value);
    }

    return Boolean(parseInt(value));
  },

  /** 判断一个日期或日期时间字符串是否在最小和最大时间戳之间 */
  isOutOfRange: (
    inputStr: string,
    minTimestamp: number | undefined,
    maxTimestamp: number | undefined,
  ): boolean => {
    if (isNil(inputStr)) {
      return false;
    }

    const inputTime = dayjs(inputStr).unix();

    if (isNaN(inputTime)) return false;

    if (!isNil(minTimestamp) && !isNaN(minTimestamp) && inputTime < minTimestamp) {
      return true;
    }

    if (!isNil(maxTimestamp) && !isNaN(maxTimestamp) && inputTime > maxTimestamp) {
      return true;
    }

    return false;
  },

  requestRefOptions: async (params) => {
    return await getRefList(params);
  },

  requestLot2SnOptions: async (params) => {
    return await getLot2SnList(params);
  },

  formatValue: (fieldType, value) => {
    if ([FIELD_TYPE.INTEGER, FIELD_TYPE.LONG].includes(fieldType)) {
      const _val_ = parseInt(value);
      return isNaN(_val_) ? undefined : _val_;
    } else if (fieldType === FIELD_TYPE.DECIMAL) {
      const _val_ = parseFloat(value);
      return isNaN(_val_) ? undefined : _val_;
    } else if (fieldType === FIELD_TYPE.BOOLEAN) {
      return renderUtils.getBoolValue(value);
    }
    return value;
  },

  /** 获取流程字段权限map */
  getBpmnFieldAuthMap: (list) => {
    return Object.fromEntries(
      list.map((item) => {
        return [`${item.modelKey}.${item.field}`, { ...item }];
      }),
    );
  },

  /** 处理字段列表-优先编辑 */
  deduplicateFields: (data) => {
    const map = new Map<string, any>();

    data.forEach((item) => {
      const key = `${item.modelKey}_${item.field}`;
      if (!map.has(key)) {
        map.set(key, item);
      } else {
        const existing = map.get(key)!;
        // 优先保留 edit: true 的记录
        if (item.edit && !existing.edit) {
          map.set(key, item);
        }
      }
    });
    return Array.from(map.values());
  },

  /** 根据模板信息集合筛选字段信息集合 */
  getFieldsByDataCenter: async (dataCenter: any, useDynRowHeight: boolean) => {
    const mainForeignFields = new Set();
    const subForeignFields = new Map();
    const modelKeyMap = new Set();
    const useDefaultValueFields = {}; // 使用对象代替数组
    const tdIdGroups = new Map();
    const useAppendixFields = {};
    const useSignFields = {};
    const useClsReasonDataLink: string[] = [];
    const useClsGroupDataLink: string[] = [];

    // 动态
    const EXCLUDED_COMPONENT_TYPES = new Set([
      ComponentTypeEnum.Inputnumber,
      ComponentTypeEnum.InputDouble,
      ComponentTypeEnum.UploadImage,
      ComponentTypeEnum.Sign,
      ComponentTypeEnum.UploadFile,
      ComponentTypeEnum.EXPRESSION,
      ComponentTypeEnum.AGG,
      ComponentTypeEnum.Trace,
    ]);

    const reasonMap = {
      [FIELD_TYPE.SCRAP_GROUP]: FIELD_TYPE.SCRAP_REASON,
      [FIELD_TYPE.NOT_GOOD_GROUP]: FIELD_TYPE.NOT_GOOD_REASON,
    };

    const groupMap = {
      [FIELD_TYPE.SCRAP_REASON]: FIELD_TYPE.SCRAP_GROUP,
      [FIELD_TYPE.NOT_GOOD_REASON]: FIELD_TYPE.NOT_GOOD_GROUP,
    };

    const pushField = async (field, opts, tdInfo, componentType) => {
      if (!field) return;

      const {
        isFieldModel,
        fieldLink,
        subFieldKey,
        subModelKey,
        fieldType,
        defaultSysDate,
        defaultValue,
        timeType,
        dateType,
        viewState,
        prefix,
        suffix,
        enableCustomFormat,
        customFormat,
        format,
        autofillRules,
      } = field;

      const fieldId = field[opts.fieldAttr];
      const modelKey = field[opts.modelAttr];

      if (!fieldId || fieldId === 'value_') return;

      const key = subFieldKey && subModelKey ? `${fieldId}.${subModelKey}` : fieldId;

      if (!subFieldKey && !subModelKey) {
        if (isFieldModel) {
          mainForeignFields.add(fieldLink);
        }
      } else {
        const subKey = `${subFieldKey}.${subModelKey}`;
        if (!subForeignFields.has(subKey)) {
          subForeignFields.set(subKey, new Set());
        }
        if (isFieldModel) {
          subForeignFields.get(subKey).add(fieldLink);
        }
      }

      if (!isFieldModel) {
        modelKeyMap.add(modelKey);

        const shouldPushDefaultValueField =
          ([
            FIELD_TYPE.DATE,
            FIELD_TYPE.DATE_TIME,
            FIELD_TYPE.TIME,
            FIELD_TYPE.TRACE_DATE,
            FIELD_TYPE.WAREHOUSE_RECEIPT_DATE,
          ].includes(fieldType) &&
            defaultSysDate) ||
          ([FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI].includes(fieldType) &&
            defaultValue === FieldSysVarDefaultValueEnum.CURRENT_USER) ||
          ([FIELD_TYPE.ORG, FIELD_TYPE.ORG_MULTI].includes(fieldType) &&
            defaultValue === FieldSysVarDefaultValueEnum.CURRENT_ORG) ||
          ([
            FIELD_TYPE.MATERIAL_NO,
            FIELD_TYPE.RELATED_LOT_NO,
            FIELD_TYPE.PRODUCT,
            FIELD_TYPE.ROUTING_OPERATION,
            FIELD_TYPE.MFG_ORDER,
          ].includes(fieldType) &&
            !subFieldKey &&
            !subModelKey) ||
          (!isNil(defaultValue) && defaultValue !== '');

        if (shouldPushDefaultValueField && !useDefaultValueFields[key]) {
          useDefaultValueFields[key] = {
            fieldId,
            fieldType,
            modelKey,
            isFieldModel,
            subModelKey,
            subFieldKey,
            timeType,
            dateType,
            defaultValue,
            autofillRules,
          };
        }

        const shouldPushAppendixField = [FIELD_TYPE.ATTACHMENT, FIELD_TYPE.IMAGE].includes(
          fieldType,
        );
        if (shouldPushAppendixField && !useAppendixFields[key]) {
          useAppendixFields[key] = {
            fieldId,
            fieldType,
            modelKey,
            isFieldModel,
            subModelKey,
            subFieldKey,
          };
        }

        if ([FIELD_TYPE.SIGNATURE].includes(fieldType)) {
          const {
            signatureNumber = SignatureNumberTypeEnum.SIGNATURE_MULTIPLE,
            signatureType,
            signTimeType,
            populateFields = [],
          } = field;

          const shouldProcess =
            signatureNumber === SignatureNumberTypeEnum.SIGNATURE_SINGLE &&
            signatureType !== SignatureTypeEnum.SIGNATURE_ONLY &&
            signTimeType === SignatureTimeTypeEnum.POPULATE_FIELD &&
            populateFields.length > 0;

          if (shouldProcess) {
            populateFields.forEach((item) => {
              const _key =
                item.subFieldKey && item.subModelKey
                  ? `${item.field}.${item.subModelKey}`
                  : item.field;

              if (!useSignFields[_key]) {
                const {
                  field: fieldId,
                  fieldType,
                  model: modelKey,
                  isFieldModel,
                  subModelKey,
                  subFieldKey,
                } = item;

                useSignFields[_key] = {
                  fieldId,
                  fieldType,
                  modelKey,
                  isFieldModel,
                  subModelKey,
                  subFieldKey,
                };
              }
            });
          }
        }

        // 不良原因/分类、报废原因/分类 数据联动
        const reason = reasonMap[fieldType];
        if (reason) {
          useClsReasonDataLink.push(`${modelKey}.${reason}`);
        }
        const group = groupMap[fieldType];
        if (group) {
          useClsGroupDataLink.push(`${modelKey}.${group}`);
        }
      }

      if (!useDynRowHeight) return;
      if (!opts.needDyn) return;

      tdInfo.newDynConfig ??= {};

      // 如果是组合字段需要进行补充子表信息
      if (tdInfo.cellWidget.component === ComponentTypeEnum.CombineFields) {
        if (subFieldKey && subModelKey) {
          tdInfo.cellWidget.props.subFieldKey = subFieldKey;
          tdInfo.cellWidget.props.subModelKey = subModelKey;
        }
      }

      const isReadonlyComponent =
        viewState === CellWidgetViewState.Disabled || viewState === CellWidgetViewState.Auto;
      const readonlyString =
        isReadonlyComponent ||
        EXCLUDED_COMPONENT_TYPES.has(
          componentType || (tdInfo.cellWidget.component as ComponentTypeEnum),
        )
          ? 'readonly-component'
          : 'readonly-text';

      const dataFsSymbol = {
        isFieldModel,
        field: isFieldModel ? fieldLink : fieldId,
        fieldType,
        componentType: tdInfo.cellWidget.component,
        enableCustomFormat,
        customFormat,
        format,
      };

      const dataFsTemplate = `${prefix ?? ''}<gct>!\${${
        isFieldModel ? fieldLink : fieldId
      }}+</gct>${suffix ?? ''}`;
      const configKey = opts.isRef ? opts.key : 'gct-main';

      tdInfo.newDynConfig[configKey] ??= [];
      tdInfo.newDynConfig[configKey].push({
        viewType: readonlyString,
        template: dataFsTemplate,
        fSymbol: dataFsSymbol,
      });
    };

    const pushTd = async (tdInfo) => {
      if (!tdInfo) return;
      let flagKey = 'gct_mobile_main';
      // 字段是主模型或者固定表的
      if (tdInfo.preLocation === ComponentTypeEnum.PAPER) {
        if (tdInfo.props.isNewFixedTableTd || tdInfo.props.isNewCheckTable2D) {
          // 固定表 检验表
          flagKey = `gct_mobile_sub.${tdInfo.props.fixedTableFieldId}`;
        }
      } else {
        // 动态表 二维表
        const subTableInfo = dataCenter?.[tdInfo.preLocation];
        if (subTableInfo) {
          flagKey = `gct_mobile_sub.${subTableInfo.props.field}`;
        }
      }

      if (!tdIdGroups.has(flagKey)) {
        tdIdGroups.set(flagKey, new Set());
      }

      tdIdGroups.get(flagKey).add(tdInfo.id);
    };

    await processWidgets(dataCenter, pushField, pushTd);

    // subForeignFields 转成数组
    const subModelFields = Array.from(subForeignFields.entries()).map(([key, values]) => {
      const [fieldKey, modelKey] = key.split('.');
      return {
        masterFieldKey: fieldKey,
        subModelKey: modelKey,
        foreignFields: Array.from(values),
      };
    });

    return {
      foreignFields: Array.from(mainForeignFields),
      subModelFields,
      modelKeyList: Array.from(modelKeyMap),
      useDefaultValueFields: Object.values(useDefaultValueFields),
      useAppendixFields: Object.values(useAppendixFields),
      useSignFields: Object.values(useSignFields),
      tdIdGroups,
      useClsReasonDataLink,
      useClsGroupDataLink,
    };
  },

  /** 提前设置值给widget */
  setRequestInfo2DataCenter: async (
    dataCenter,
    modelKeys,
    platformType,
    isMockReport,
    formType: FormTypeEnum,
    paramsConfig,
    useSignFields,
    useClsReasonDataLink,
    useClsGroupDataLink,
    tmplBomC: FormTmplBomController,
  ) => {
    if (formType === FormTypeEnum.VIEW || formType === FormTypeEnum.FILE) {
      return;
    }

    let result;
    if (Array.isArray(modelKeys) && modelKeys.length !== 0) {
      const res = await getModelComprehensiveModelDetailListByKeysByModelCategory(
        { modelCategory: 'entity' },
        { modelKeys: modelKeys.join(',') },
      );
      result =
        res?.map((item) => {
          return {
            modelKey: item.key,
            modelName: item.name,
            metaList: item.fieldMetaList,
          };
        }) ?? [];
    }

    // 将数组转换为对象结构
    const modelMap = result?.reduce((acc, { modelKey, modelName, metaList }) => {
      acc[modelKey] = {
        name: modelName,
        list: metaList,
      };
      return acc;
    }, {});

    const deptRes = await getDeptList();

    const pushField = async (field, opts) => {
      if (!field) return;

      const { isFieldModel, subFieldKey, subModelKey, fieldType } = field;
      const fieldId = field[opts.fieldAttr];
      const modelKey = field[opts.modelAttr];

      if (fieldId === 'value_') {
        const userIdKey = isMockReport ? 'modify_user_id_' : fieldId;
        const userRes = await getUserList(modelKey, userIdKey);
        field.tempOrgOptions = deptRes.options;
        field.tempUserOptions = userRes.options;
        field.tempModelName = modelMap?.[modelKey]?.name;
      }

      if (!fieldId || fieldId === 'value_' || isFieldModel) return;

      const key = subFieldKey && subModelKey ? subModelKey : modelKey;
      const needDataLink = useClsReasonDataLink.includes(`${key}.${fieldType}`);
      const groupDataLink = useClsGroupDataLink.includes(`${key}.${fieldType}`);

      field.newSpecificConfig = {};

      const fieldInfo = modelMap?.[key]?.list?.find((item) => item.key === fieldId);
      // 设置必填
      field.newSpecificConfig.newRequired = Boolean(fieldInfo?.required) || field.required;
      // 设置字段名称
      field.newSpecificConfig.newFieldName = fieldInfo?.name;
      // 设置字段所属模型名称
      field.newSpecificConfig.newModelName = modelMap?.[key]?.name;
      // mappingType 数据库存储的原始格式
      field.newSpecificConfig.mappingType = fieldInfo?.mappingType;
      const defaultQuery: any = {};
      if (field.field === 'warehouse_id_' || field.field === 'location_id_') {
        defaultQuery.operating_state_ = true;
      }

      // 设置 options 配置
      const setOptions = async () => {
        switch (fieldType) {
          case FIELD_TYPE.ORG:
          case FIELD_TYPE.ORG_MULTI:
            return deptRes;

          case FIELD_TYPE.ENUM:
          case FIELD_TYPE.ENUM_MULTI:
            return await getEnumList(modelKey, fieldId);

          case FIELD_TYPE.OPTION:
          case FIELD_TYPE.OPTION_MULTI:
            return {
              options: JSON.parse(field.optionsJson ?? '[]'),
            };

          case FIELD_TYPE.USER:
          case FIELD_TYPE.USER_MULTI:
            const userIdKey = isMockReport ? 'modify_user_id_' : fieldId;
            return await getUserList(modelKey, userIdKey);

          case FIELD_TYPE.BOOLEAN:
            const options =
              platformType === PlatformEnum.INTEGRATION_PAAS_SI
                ? [
                    {
                      label: field.trueText,
                      value: true,
                      refFields: field.trueRefFields ?? [],
                      _item: {},
                    },
                    {
                      label: field.falseText,
                      value: false,
                      refFields: field.falseRefFields ?? [],
                      _item: {},
                    },
                  ]
                : Object.entries(pick(fieldInfo.specificConfig, ['true', 'false']) || {}).map(
                    ([key, label]) => ({
                      label,
                      value: key === 'true',
                      _item: {},
                    }),
                  );

            return {
              options,
            };

          case FIELD_TYPE.ROUTING_OPERATION:
            return await getRefList({
              modelKey,
              fieldKey: fieldId,
              refModelKey: field.refModelKey,
              isRdo: false,
              queryData: {
                ref_master_id_: paramsConfig?.routingId,
                type_: 'NODE_SPEC',
              },
            });
          case FIELD_TYPE.DEVICE:
          case FIELD_TYPE.MFG_ORDER:
          case FIELD_TYPE.NOT_GOOD_REASON:
          case FIELD_TYPE.NOT_GOOD_GROUP:
          case FIELD_TYPE.SCRAP_REASON:
          case FIELD_TYPE.SCRAP_GROUP:
          case FIELD_TYPE.DEVICE_REF:
          case FIELD_TYPE.DEVICE_REF_MULTI:
            return await getRefList({
              modelKey,
              fieldKey: fieldId,
              refModelKey: field.refModelKey,
              isRdo: false,
              needDataLink,
              queryData: {
                operating_state_:
                  (window as any)?._gct?.store?.appInfo?.suiteKey === 'eDHR' &&
                  fieldType !== FIELD_TYPE.MFG_ORDER
                    ? true
                    : undefined,
              },
            });

          case FIELD_TYPE.PRODUCT:
          case FIELD_TYPE.SCRAP_MATERIAL:
            // 额外查询参数
            const newQueryData = field?.newSpecificConfig?.newQueryData ?? {};
            return await getRefList({
              modelKey,
              fieldKey: fieldId,
              refModelKey: field.refModelKey,
              rmIfNoDefaultVersion: 0, // 不加带query的时候非默认子版本会被删除
              isRdo: true,
              queryData: {
                operating_state_: true,
                ...newQueryData,
              },
              pageSize: 20,
            });

          case FIELD_TYPE.SCRAP_MATERIAL_NO:
          case FIELD_TYPE.MATERIAL_NO:
          case FIELD_TYPE.RELATED_LOT_NO:
            return await getLot2SnList({
              pageSize: 20,
              isMaterialConsumeField: field.isMaterialConsumeField,
            });

          case FIELD_TYPE.REF:
          case FIELD_TYPE.REF_MULTI:
            const queryCondition = refUtils.generateQueryConditions(field.dataFilter, paramsConfig);
            return await getRefList({
              modelKey,
              fieldKey: fieldId,
              refModelKey: field.refModelKey,
              queryData: {
                ...queryCondition.dataFilterFixedQueryData,
                ...defaultQuery,
              },
              // 库位需要数据联动，初始化不要加载
              needDataLink: field.field === 'location_id_',
              exp: queryCondition.dataFilterExp,
              isRdo: false,
            });
          default:
            return {
              options: [],
            };
        }
      };

      // 设置上传配置
      const setUploadConfig = () => {
        if (fieldType !== FIELD_TYPE.ATTACHMENT && fieldType !== FIELD_TYPE.IMAGE) return;

        if (platformType === PlatformEnum.INTEGRATION_PAAS_SI) {
          const defaultAccept = {
            [FIELD_TYPE.ATTACHMENT]: ['pdf', 'xlsx', 'doc', 'mp4'],
            [FIELD_TYPE.IMAGE]: ['jpg', 'jpeg', 'png', 'bmp'],
          };
          return {
            /** 单个文件大小 */
            maxSize: field.maxSize,
            /** 最大上传数量 */
            maxCount: field.maxCount,
            /** 支持的格式数组 */
            accept: field.accept && field.accept.length ? field.accept : defaultAccept[fieldType],
            /** 是否显示文件名称 */
            showFileName: Boolean(field.showFileName ?? 1),
          };
        } else if (fieldInfo?.specificConfig) {
          const { fileSize, maxNumber, fileTypes } = fieldInfo.specificConfig;
          return {
            maxSize: fileSize,
            maxCount: maxNumber,
            accept: (fileTypes ?? []).map((type) => type.toLocaleLowerCase()),
          };
        }
        return {};
      };

      // 设置精度
      const setPrecision = () => {
        if (fieldType === FIELD_TYPE.DECIMAL || fieldType === FIELD_TYPE.WORK_HOURS) {
          if (platformType === PlatformEnum.INTEGRATION_PAAS_SI) {
            return fieldInfo?.specificConfig?.digits ?? 0;
          } else {
            return field.precision ?? 0;
          }
        }
        return undefined;
      };

      const setRulesForRounding = () => {
        return fieldInfo?.specificConfig?.rulesForRounding ?? 1; // 老数据没有修约规则，默认采用的截取
      };

      // 设置查询条件
      const setQueryConditions = () => {
        if (fieldType === FIELD_TYPE.REF || fieldType === FIELD_TYPE.REF_MULTI) {
          const queryCondition = refUtils.generateQueryConditions(field.dataFilter, paramsConfig);
          queryCondition.dataFilterFixedQueryData = {
            ...queryCondition.dataFilterFixedQueryData,
            ...defaultQuery,
          };
          if (field.field === 'location_id_') {
            // 数据联动映射
            const linkFieldInfo = modelMap?.[key]?.list?.find(
              (item) => item.key === 'warehouse_id_',
            );
            // 库位的数据联动配置项，当仓库没有选择时，抛出提示信息
            queryCondition.clsReasonDataLinkStatus = true;
            queryCondition.clsReasonDataLinkInfo = {
              value: 'warehouse_id_',
              label: linkFieldInfo?.name ?? 'warehouse_id_',
              refModelChain: [],
            };
          }
          return queryCondition;
        } else if (
          [FIELD_TYPE.NOT_GOOD_REASON, FIELD_TYPE.SCRAP_REASON].includes(fieldType) &&
          needDataLink
        ) {
          // 数据联动映射
          const reasonMap = {
            [FIELD_TYPE.SCRAP_REASON]: {
              linkFieldId: 'scrap_group_1_',
              refModelChain: [
                { modelKey: 'em_scrap_group', modelCategory: 'entity', fieldKey: 'entries_' },
                {
                  modelKey: 'em_scrap_group_entry',
                  modelCategory: 'entity',
                  fieldKey: 'scrap_reason_id',
                },
                { modelKey: 'em_scrap_reason', modelCategory: 'entity', fieldKey: 'id_' },
              ],
            },
            [FIELD_TYPE.NOT_GOOD_REASON]: {
              linkFieldId: 'not_good_group_1_',
              refModelChain: [
                { modelKey: 'em_not_good_group', modelCategory: 'entity', fieldKey: 'entries_' },
                {
                  modelKey: 'em_not_good_group_entry',
                  modelCategory: 'entity',
                  fieldKey: 'not_good_reason_id_',
                },
                { modelKey: 'em_not_good_reason', modelCategory: 'entity', fieldKey: 'id_' },
              ],
            },
          };
          const linkFieldData = reasonMap[fieldType];
          const linkFieldId = linkFieldData.linkFieldId;
          const linkFieldInfo = modelMap?.[key]?.list?.find((item) => item.key === linkFieldId);

          return {
            dataFilterVarFields: [linkFieldId],
            clsReasonDataLinkStatus: Boolean(needDataLink),
            clsReasonDataLinkInfo: {
              value: linkFieldId,
              label: linkFieldInfo?.name ?? linkFieldId,
              refModelChain: linkFieldData.refModelChain,
            },
          };
        } else if (
          [FIELD_TYPE.NOT_GOOD_GROUP, FIELD_TYPE.SCRAP_GROUP].includes(fieldType) &&
          groupDataLink
        ) {
          // 切换分类进行清空原因数据
          const groupMap = {
            [FIELD_TYPE.SCRAP_GROUP]: 'scrap_reason_1_',
            [FIELD_TYPE.NOT_GOOD_GROUP]: 'not_good_reason_1_',
          };
          return {
            clearFieldId: groupMap[fieldType],
            clsGroupDataLinkStatus: Boolean(groupDataLink),
          };
        }
      };

      // 设置记录单号是否是链接标识
      const setRefRecordNo = () => {
        if (fieldType !== FIELD_TYPE.RECORD_NO) return;
        return Boolean(fieldInfo?.specificConfig?.refRecordNo);
      };

      // 设置查询条件
      const setFetchQueryData = () => {
        if (fieldType !== FIELD_TYPE.ROUTING_OPERATION) return;
        return {
          ref_master_id_: paramsConfig?.routingId,
          type_: 'NODE_SPEC',
        };
      };

      // 强制设置日期、日期时间为禁用状态
      const setForced2DisabledState = () => {
        if ([FIELD_TYPE.DATE, FIELD_TYPE.DATE_TIME].includes(fieldType)) {
          const hasExistingField = useSignFields?.some(
            (item) =>
              item.fieldId === fieldId && item.modelKey === key && item.fieldType === fieldType,
          );

          if (hasExistingField) {
            return true;
          }
        }

        if (
          FIELD_TYPE.RECORD_NO === fieldType &&
          fieldInfo?.specificConfig?.signGenerate === RecordNoGenerateEnum.SN_RULE
        ) {
          // 流程单据的记录单号字段强制禁用  自动生成的时候
          return true;
        }
        if (field.field === 'material_balance_percent_' || field.field === 'material_id_') {
          return true;
        }
      };
      function setPlaceholder() {
        if (
          FIELD_TYPE.RECORD_NO === fieldType &&
          fieldInfo?.specificConfig?.signGenerate === RecordNoGenerateEnum.SN_RULE
        ) {
          // 流程单据的记录单号字段强制禁用  自动生成的时候
          return '记录单号自动生成，无需填写';
        }
      }
      const setDisplayRule = () => {
        return fieldInfo?.specificConfig?.displayRule ?? undefined;
      };
      // 应用配置
      field.newSpecificConfig.newQueryData = setFetchQueryData();
      // 物料消耗表特殊处理field
      tmplBomC.handleField(field);
      const setRes = await setOptions();
      field.newSpecificConfig.newOptions = setRes.options;
      field.newSpecificConfig.newLoadFinished2Options = setRes.finished;
      field.newSpecificConfig.newTotalCount = setRes.totalCount;
      field.newSpecificConfig.newUploadConfig = setUploadConfig();
      field.newSpecificConfig.newPrecision = setPrecision();
      field.newSpecificConfig.newRulesForRounding = setRulesForRounding();
      field.newSpecificConfig.newRefRecordNo = setRefRecordNo();
      field.newSpecificConfig.newQueryCondition = setQueryConditions();
      field.newSpecificConfig.forcedDisabled = setForced2DisabledState();
      field.newSpecificConfig.newPlaceholder = setPlaceholder();
      field.newSpecificConfig.newDisplayRule = setDisplayRule();
    };

    await processWidgets(dataCenter, pushField);

    requestUtils.clearCache();
  },

  /** 获取默认值集合 */
  getDefaultValueMapByField: ({
    defaultValueFields,
    mainMaterialNo = undefined,
    mainRelatedLotNo = undefined,
    mainProductName = undefined,
    mainRoutingOperation = undefined,
    mainMfgOrderId = undefined,
    defaultUserId,
    defaultOrgId,
    operationData,
    productData,
    mfgOrderData,
  }) => {
    const defaultDataMap = new Map();

    // 通用函数：根据字段类型获取默认值
    const getDefaultValue = (field) => {
      const { fieldType, timeType, dateType, defaultValue } = field;

      switch (fieldType) {
        case FIELD_TYPE.DATE:
        case FIELD_TYPE.DATE_TIME:
        case FIELD_TYPE.TIME:
        case FIELD_TYPE.TRACE_DATE:
        case FIELD_TYPE.WAREHOUSE_RECEIPT_DATE:
          const formatType = fieldType === FIELD_TYPE.TIME ? timeType : dateType;
          return () => {
            const valueFormat = DateFormat[formatType]?.valueFormat;
            return valueFormat ? dayjs().format(valueFormat) : undefined;
          };
        case FIELD_TYPE.USER:
        case FIELD_TYPE.USER_MULTI:
          return defaultUserId;
        case FIELD_TYPE.ORG:
        case FIELD_TYPE.ORG_MULTI:
          return defaultOrgId;
        case FIELD_TYPE.MATERIAL_NO:
          return mainMaterialNo;
        case FIELD_TYPE.RELATED_LOT_NO:
          return mainRelatedLotNo;
        case FIELD_TYPE.PRODUCT:
          return mainProductName;
        case FIELD_TYPE.ROUTING_OPERATION:
          return mainRoutingOperation;
        case FIELD_TYPE.MFG_ORDER:
          return mainMfgOrderId;
        default:
          return defaultValue;
      }
    };

    // 通用函数：为 Map 添加值
    const assignValue = (key, id, value) => {
      if (!defaultDataMap.has(key)) defaultDataMap.set(key, {});
      defaultDataMap.get(key)[id] = value;
    };

    // 遍历字段集合
    defaultValueFields.forEach((field) => {
      const { subFieldKey, fieldId, fieldType, autofillRules } = field;
      const key = subFieldKey || 'gct_main'; // 如果没有 subFieldKey，默认使用 'gct_main'
      // 先赋默认值
      assignValue(key, fieldId, getDefaultValue(field));

      // 如果有 autofillRules，处理自动填充
      if (Array.isArray(autofillRules) && autofillRules.length > 0) {
        // 根据 fieldType 选择数据源
        let sourceData =
          fieldType === FIELD_TYPE.PRODUCT
            ? productData
            : fieldType === FIELD_TYPE.ROUTING_OPERATION
              ? operationData
              : null;
        if (fieldType === FIELD_TYPE.MFG_ORDER) {
          sourceData = mfgOrderData;
        }
        if (sourceData) {
          autofillRules.forEach(({ fromField, toField }) => {
            assignValue(key, toField, sourceData?.[fromField]);
          });
        }
      }
    });

    return Object.fromEntries(defaultDataMap);
  },

  /** 获取默认值信息 */
  getDefaultValueInfo: ({ defaultDataMap, key }) => {
    const data = defaultDataMap[key];
    console.log('defaultDataMap', defaultDataMap);
    return Object.keys(data || {}).reduce((res, fieldId) => {
      res[fieldId] = typeof data[fieldId] === 'function' ? data[fieldId]() : data[fieldId];
      return res;
    }, {});
  },

  fetchMultipleModelData: async (
    requests: {
      modelKey: string;
      bsKey: string;
      params?: Record<string, any>;
      modelCategory?: string;
      api?: any;
    }[],
  ) => {
    // 构造 Promise 数组
    const tasks = requests.map(
      async ({ modelKey, bsKey, params = {}, modelCategory = 'entity', api }) => {
        // 判断参数是否存在有效值
        const hasValidParam = Object.values(params).some(
          (v) => v !== null && v !== undefined && v !== '',
        );

        if (!hasValidParam) {
          return null;
        }

        try {
          const res = await (
            api || getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey
          )({ modelKey, bsKey, modelCategory }, params);
          return res?.data;
        } catch (err) {
          return null;
        }
      },
    );

    // 并发执行所有请求
    return Promise.all(tasks);
  },
};
