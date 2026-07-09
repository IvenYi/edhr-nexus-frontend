import {
  cloneDeep,
  pick,
  groupBy,
  omitBy,
  isEqual,
  merge,
  omit,
  isEmpty,
  has,
  flatMap,
  pickBy,
  isNil,
  zip,
  mapKeys,
  isObject,
  defaults,
} from 'lodash-es';
import {
  RenderModeEnum,
  JoinModelTypeEum,
  ParamModelTypeEnum,
  MobileFillTypeEnum,
} from '../constant';
import { renderUtils } from './render';
import { CodeRunner } from './code-runner';
import { sqlUtils } from './sql';
import { jsonSchemaUtils } from './json-schema';
import { uuid2 } from '../_utils_';
import message from '../_utils_/message';
import { getModelMetaInfo } from '/@/apis/gct-apaas/ModelMetaController';
import { postDataSourceSelect } from '/@/apis/gct-apaas/DataSourceController';
import { getOnlineFormInstanceGetRelatedProduct } from '/@/apis/gct-apaas/OnlineFormInstanceController';
import { postOnlineFormBizBizServiceSummary } from '/@/apis/gct-apaas/OnlineFormBizController';
import { getOnlineFormDataInitProtocolData } from '/@/apis/gct-apaas/OnlineFormDataInitController';
import { postIpaasWebhook } from '/@/apis/gct-apaas/IPaaSController';
import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { IPaper } from '../types';
import { FIELD_TYPE } from '@gct/runtime';

const DEFAULT_FROM_STATE = {
  _DICT: {}, //翻译的字段
  _OPCT: {}, //关联模型字段完全体
  _MCTABLE: {}, // 物料消耗表业务数据
};

const DYN_FIELD_KEY = [
  'name_',
  'type_',
  'validate_range_',
  'max_int_',
  'min_int_',
  'max_decimal_',
  'min_decimal_',
  'digits_',
  'true_text_',
  'false_text_',
  'validate_true_',
  'validate_false_',
  'options_',
  'pattern_',
  'regex_',
  'required_',
  'default_value_',
  'show_type_',
  'tip_text_',
];

/** 设置脚本 */
function setCodeRunner(javascript, globalData, ofCtx) {
  return new CodeRunner(javascript, globalData, {
    $updateLayout: async (tid?: string) => {
      if (ofCtx && ofCtx.updatePageData) {
        const basicIns = ofCtx.findBasicInsInfo(tid || ofCtx.tid);
        if (basicIns) {
          ofCtx.updatePageData(basicIns.uniqueId);
        }
      }
    },
    $request: async ({ action, modelKey, modelCategory, query, body }) => {
      const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
        {
          bsKey: action,
          modelKey,
          modelCategory: modelCategory || 'entity',
        },
        body,
        query,
        {
          ignoreParamsToData: true,
        },
      );
      return res;
    },
    $message: (msg, type) => {
      message[type || 'info']?.(msg);
    },
    $formPrint: () => ofCtx.formPrint(ofCtx.id),
  }) as any;
}

function transformSourceData(sourceData, i18nData) {
  const cloneSourceData = cloneDeep(sourceData);

  const _DICT = i18nData
    ? Object.keys(cloneSourceData).reduce((total, curr) => {
        const map = i18nData[curr],
          value = cloneSourceData[curr];
        if (map && value) {
          try {
            const label = value.split(',').map((k) => map[k]);
            total[curr] = { [value]: label };
          } catch (error) {
            // 忽略解析错误，保持兼容性
          }
        }
        return total;
      }, {})
    : cloneSourceData._DICT || {};

  // 递归处理 __FOREIGN__
  const _OPCT = cloneSourceData.__FOREIGN__
    ? transformSourceData(cloneSourceData.__FOREIGN__, i18nData)
    : {};

  // 递归处理 _MCTABLE
  const _MCTABLE = {};

  // 递归处理 __CHILDREN__
  const children =
    Array.isArray(cloneSourceData.__CHILDREN__) && cloneSourceData.__CHILDREN__.length
      ? cloneSourceData.__CHILDREN__.map((c) => transformSourceData(c, i18nData))
      : Array.isArray(cloneSourceData.__CHILDREN__)
        ? []
        : cloneSourceData.__CHILDREN__;

  return {
    ...cloneSourceData,
    _DICT,
    _OPCT,
    _MCTABLE,
    __FOREIGN__: null,
    __CHILDREN__: children,
  };
}

function transformSourceData2SubTable(
  data,
  dict = {},
): { _DICT: object; _OPCT: object; [key: string]: any }[] {
  const list = data?.map((i) => transformSourceData(i, dict));
  return list || [];
}

// 比较组内所有对象，提取相同的键值对
function getCommonFields(items) {
  const commonFields = { ...items[0] };

  items.forEach((item) => {
    Object.keys(commonFields).forEach((key) => {
      if (!isEqual(commonFields[key], item[key])) {
        delete commonFields[key];
      }
    });
  });

  return commonFields;
}

/** 初始化二维表子表的子表 */
function initSubTable2dChildList(key: string, initRowLen) {
  return {
    group_: `${key}${uuid2(16)}`,
    // 二维表
    _2DTABLE_: Array.from({ length: initRowLen }, (_, index) => ({
      ...cloneDeep(DEFAULT_FROM_STATE),
    })),
  };
}

/**
 * 设置子表的formState数据
 * 接口格式是
 * const formData = {
 *    subtable1: {
 *      data: [{}, {}, {}],
 *      dict: {}
 *    }
 * }
 */
function setSubTableFormState(
  modeType: RenderModeEnum,
  sInfo: any,
  formState: Record<string, any>,
) {
  const subFormData = formState[sInfo.field];
  const is2DTable = sInfo.subTable2d && sInfo.key === 'dyn';
  const isCheckTable = sInfo.checkTable2d && sInfo.key === 'newfixed';

  // 空的情况， 那么需要初始化
  if (!subFormData || !subFormData?.data?.length) {
    const init_table_data = Array.from({ length: sInfo.initRowLen }, (_, index) => {
      const baseData = cloneDeep(DEFAULT_FROM_STATE);

      // 二维表 或者 检验表
      if (is2DTable || isCheckTable) {
        Object.assign(baseData, initSubTable2dChildList(sInfo.key, sInfo.childInitRowLen));
      }
      if (isCheckTable) {
        Object.assign(baseData, sInfo.checkDsData?.[index] ?? {});
      }
      return baseData;
    });

    // merge(formState, {
    //   [sInfo.field]: init_table_data,
    // });
    // formState[sInfo.field] = init_table_data;
    formState[sInfo.field] = merge([], subFormData, init_table_data); // 需要合并，不然默认值会被覆盖掉
  } else {
    // 二维表 或者 检验表
    if (is2DTable || isCheckTable) {
      const grouped = groupBy(subFormData.data, 'group_');

      const restoredData = Object.entries(grouped).map(([groupKey, items]) => {
        // 获取当前组中的公共字段
        const commonFields = getCommonFields(items);

        // 构建每项的 _2DTABLE_
        const _2DTABLE_ = items.map((item) => {
          if (!isEmpty(item.value_) && item.type_ === FIELD_TYPE.BOOLEAN) {
            item.value_ = [true, 'true', '1', 'yes', 'y'].includes(item.value_);
          }
          return {
            ...transformSourceData(
              omitBy(item, (_, key) => !sInfo.crossFieldKeys.includes(key)),
              subFormData.dict,
            ),
            ...(item.id_ ? { id_: item.id_ } : {}),
          };
        });
        // 返回公共字段与 _2DTABLE_ 的组合
        return {
          ...transformSourceData(commonFields, subFormData.dict),
          _2DTABLE_,
        };
      });

      // merge(formState, {
      //   [sInfo.field]: restoredData,
      // });
      formState[sInfo.field] = restoredData;
    } else {
      // 固定表要补缺少行数问题
      let fixedTableData: any = [];
      if (sInfo.key === 'newfixed' && subFormData.data?.length !== sInfo.initRowLen) {
        fixedTableData = Array.from({ length: sInfo.initRowLen - subFormData.data?.length }, () =>
          cloneDeep(DEFAULT_FROM_STATE),
        );
      }

      // merge(formState, {
      //   [sInfo.field]: transformSourceData2SubTable(
      //     [...subFormData.data, ...fixedTableData],
      //     subFormData.dict,
      //   ),
      // });
      formState[sInfo.field] = transformSourceData2SubTable(
        [...subFormData.data, ...fixedTableData],
        subFormData.dict,
      );
    }
  }
}

/** 转换数据公共类 */
export const transformUtils = {
  transformSourceData2SubTable,
  getFormDataItem: (onFieldMap, subTableInfo, result) => {
    const formDataItem = { ...cloneDeep(DEFAULT_FROM_STATE) };

    if (result?.data?.length) {
      const firstData = cloneDeep(result.data[0]);

      onFieldMap.forEach((item) => {
        if (item.subModel === 0) {
          const mappedFields = item.fields.reduce(
            (prev, { isFieldModel, leftFieldKey, fieldLink, rightFieldKey }) => {
              prev[leftFieldKey] = isFieldModel
                ? firstData?.__FOREIGN__?.[fieldLink]
                : firstData[rightFieldKey];
              return prev;
            },
            {},
          );

          merge(formDataItem, mappedFields);
        } else if (item.subModel === 1) {
          const sInfo = subTableInfo.find((aa) => aa.field === item.subFieldKey) || {};

          const fieldList = result.data.map((data) =>
            item.fields.reduce((prev, { isFieldModel, leftFieldKey, fieldLink, rightFieldKey }) => {
              prev[leftFieldKey] = isFieldModel
                ? data?.__FOREIGN__?.[fieldLink]
                : data[rightFieldKey];
              return prev;
            }, {}),
          );
          let fieldList2d;
          if (
            (sInfo.subTable2d && sInfo.key === 'dyn') ||
            (sInfo.checkTable2d && sInfo.key === 'newfixed')
          ) {
            const emptyList = Array.from({ length: sInfo.childInitRowLen });

            fieldList2d = fieldList
              .map((fInfo) => {
                const group_ = `${sInfo.key}${uuid2(16)}`;
                return emptyList.map((_) => {
                  return {
                    ...fInfo,
                    group_,
                  };
                });
              })
              .flat();
          }

          merge(formDataItem, {
            [item.subFieldKey]: {
              data: fieldList2d || fieldList,
              dict: result.dict ?? {},
            },
          });
        }
      });
    }

    return formDataItem;
  },

  /** 获取子表信息列表 */
  getSubTableInfo: (paper) => {
    const {
      subTableFieldMap = [],
      fixedTableLenMap = {},
      subTable2DList = [],
      checkTable2DList = [],
      materialConsumeTableList = [],
      materialBalanceTableList = [],
    } = paper?.props ?? {};

    const subTableInfo = subTableFieldMap
      .map((key) => {
        const info = subTable2DList.find((item) => item.subTable2d && item.rowSubFieldKey === key);
        console.log('subTableFieldMap----', subTableFieldMap, info);
        const data = {
          field: key,
          initRowLen: 1,
          key: 'dyn',
          name: $t('sys.onlineForm.subTableType.DEFAULT'),
          subType: MobileFillTypeEnum.SUB_TABLE,
        };
        if (info && info.subTable2d) {
          Object.assign(data, {
            name: $t('sys.onlineForm.subTableType.2D'),
            childInitRowLen: 1 * ((fixedTableLenMap?.[info.colSubFieldKey] ?? 0) + 1),
            subType: MobileFillTypeEnum.SUB_TABLE_2D,
          });
        }

        // 物料消耗表处理
        const mcTable = materialConsumeTableList.find(
          (item) => item.masterSubField && item.masterSubField === key,
        );
        if (mcTable) {
          Object.assign(data, {
            name: $t('sys.onlineForm.subTableType.MATERIAL_CONSUMPTION'),
            subType: MobileFillTypeEnum.MATERIAL_CONSUME_TABLE,
          });
        }

        const balanceTable = materialBalanceTableList.find(
          (item) => item.masterSubField && item.masterSubField === key,
        );
        if (balanceTable) {
          Object.assign(data, {
            name: $t('sys.onlineForm.subTableType.MATERIAL_BALANCE'),
            subType: MobileFillTypeEnum.MATERIAL_BALANCE_TABLE,
          });
        }
        return {
          ...info,
          ...data,
        };
      })
      .concat(
        Object.keys(fixedTableLenMap).map((key) => {
          const info = subTable2DList.find(
            (item) => item.subTable2d && item.colSubFieldKey === key,
          );

          const data = {
            subType: MobileFillTypeEnum.FIXED_TABLE,
          };

          if (info && info.subTable2d) {
            Object.assign(data, {
              subType: MobileFillTypeEnum.SUB_TABLE_2D_LINK,
            });
          }

          return {
            field: key,
            initRowLen: fixedTableLenMap[key] + 1,
            key: 'newfixed',
            name: $t('sys.onlineForm.subTableType.FIXED'),
            ...data,
          };
        }),
      )
      .concat(
        checkTable2DList
          .filter((i) => i.checkTable2d)
          .map((checkInfo) => {
            const fixeds: any = [];
            if (checkInfo.colSubFieldKey) {
              fixeds.push({
                field: checkInfo.colSubFieldKey,
                initRowLen: checkInfo.colCount,
                key: 'newfixed',
                name: '检验表-关联',
                subType: MobileFillTypeEnum.CHECK_TABLE_2D_LINK,
              });
            }

            fixeds.push({
              field: checkInfo.rowSubFieldKey,
              initRowLen: checkInfo.rowCount,
              key: 'newfixed',
              name: '检验表-动态',
              childInitRowLen: checkInfo.colCount,
              subType: MobileFillTypeEnum.CHECK_TABLE_2D,
              ...checkInfo,
            });

            return fixeds;
          })
          .flat(),
      );

    console.log('0506 子表信息列表', subTableInfo);
    return subTableInfo;
  },

  /** 获取默认值 */
  getDefaultData: (payload: {
    /** 默认值数据 */
    defaultDataMap: any;
    /** 子表信息 */
    subTableInfo: Array<any>;
    /** 渲染模式 */
    viewMode: RenderModeEnum;
  }) => {
    const { subTableInfo, viewMode, defaultDataMap } = payload || {};

    const formState = {
      ...cloneDeep(DEFAULT_FROM_STATE),
    };

    // 填报模式 初设默认值
    if (viewMode === RenderModeEnum.FormMode) {
      // 设置主表默认值
      merge(formState, renderUtils.getDefaultValueInfo({ defaultDataMap, key: 'gct_main' }));
      // 设置子表默认值数据
      subTableInfo?.forEach((subInfo) => {
        const subDefaultData = renderUtils.getDefaultValueInfo({
          defaultDataMap,
          key: subInfo.field,
        });

        const is2DTable = subInfo.subTable2d && subInfo.key === 'dyn';
        const isCheckTable = subInfo.checkTable2d && subInfo.key === 'newfixed';

        const init_table_data = Array.from({ length: subInfo.initRowLen }, (_, index) => {
          const groupKey = `${subInfo.key}${uuid2(16)}`;
          const baseData = cloneDeep(DEFAULT_FROM_STATE);

          // 二维表 或者 检验表
          if (is2DTable || isCheckTable) {
            const extraData = is2DTable
              ? { ...omit(subDefaultData, subInfo.crossFieldKeys) }
              : (subInfo.checkDsData?.[index] ?? {});

            const _2DTABLE_ = Array.from({ length: subInfo.childInitRowLen }, () => {
              if (is2DTable) {
                return { ...baseData, ...pick(subDefaultData, subInfo.crossFieldKeys) };
              } else {
                let default_value_ = extraData.default_value_;
                if (!isEmpty(default_value_) && extraData.type_ === FIELD_TYPE.BOOLEAN) {
                  default_value_ = [true, 'true'].includes(extraData.default_value_);
                }
                //检验表默认值处理
                return { ...baseData, value_: default_value_ };
              }
            });
            return { ...baseData, group_: groupKey, _2DTABLE_, ...extraData };
          }

          return { ...baseData, ...subDefaultData };
        });

        merge(formState, {
          [subInfo.field]: init_table_data,
        });
      });
    }

    return formState;
  },

  /** 请求参数映射数据 */
  getParamData: (payload: {
    /** 纸张信息 */
    paper: any;
    /** 参数配置 */
    paramsConfig: any;
    /** 子表信息 */
    subTableInfo: any;
    /** 字段权限 */
    fieldPermission?: any[];
  }) => {
    const { paper, paramsConfig, subTableInfo, fieldPermission = [] } = payload || {};

    if (isEmpty(paper?.props?.paramsMapList) || isEmpty(paramsConfig)) {
      return {};
    }

    const referenceMap = new Map(Object.entries(paramsConfig));

    // 使用解构和箭头函数简化
    const [builtinParams, compParams] = [
      [ParamModelTypeEnum.BuiltinParam, true],
      [ParamModelTypeEnum.BuiltinParam, false],
    ].map(([type, isBuiltin]) =>
      paper.props.paramsMapList.filter((item) => {
        const field = fieldPermission.find((f) => f.field === item.field);
        return (item?.paramMapType === type) === isBuiltin && (!field || !field.readonly);
      }),
    );

    const formDataItem = { ...cloneDeep(DEFAULT_FROM_STATE) };

    const subMappedFields = {};

    // 统一处理参数逻辑
    const processParamItem = (item) => {
      if (!referenceMap.has(item.formKey)) return;

      const value = referenceMap.get(item.formKey);
      const formattedValue = renderUtils.formatValue(item.fieldType, value);

      const target = item?.subModel
        ? ((subMappedFields[item.subFieldKey] ??= {}), subMappedFields[item.subFieldKey])
        : formDataItem;

      merge(target, { [item.field]: formattedValue });
    };

    // 使用 forEach 替代 map 处理副作用
    [...builtinParams, ...compParams].forEach(processParamItem);

    // 处理子表映射
    Object.entries(subMappedFields).forEach(([key, value]) => {
      const subTableConfig = subTableInfo.find(({ field }) => field === key);
      if (!subTableConfig) return;

      const data = [value];
      let data2d;

      const { childInitRowLen, key: tableKey } = subTableConfig;
      const is2DTable =
        (subTableConfig.subTable2d && tableKey === 'dyn') ||
        (subTableConfig.checkTable2d && tableKey === 'newfixed');

      if (is2DTable) {
        const emptyList = Array.from({ length: childInitRowLen });

        data2d = data
          .map((fInfo: any) => {
            const group_ = `${tableKey}${uuid2(16)}`;
            return emptyList.map((_) => {
              return {
                ...fInfo,
                group_,
              };
            });
          })
          .flat();
      }

      merge(formDataItem, {
        [key]: {
          data: data2d || data,
          dict: {},
        },
      });
    });

    return formDataItem;
  },
  /**
   * 获取动态表单数据源  检验表初始化业务逻辑
   */
  requestCheckDsData: async (payload: {
    /** 纸张信息 */
    paper: any;
    /** 表单实例id */
    instanceId: string;
    cloneRuntimeJson: object;
  }) => {
    const { paper, instanceId, cloneRuntimeJson } = payload || {};
    const checkTable2DList = paper.props.checkTable2DList;
    if (!checkTable2DList?.length) return;
    const checkTableCustomDataSource = paper.props.customDataSource?.find(
      (info) => info.joinModelType === JoinModelTypeEum.BuiltinModel && info.joinModelKey === 'M08',
    );
    if (!checkTableCustomDataSource) return;
    const checkTableCustomFieldMap = checkTableCustomDataSource.onFieldMap.reduce((total, curr) => {
      if (curr.isCheckTable) {
        total[curr.subFieldKey] = curr.fields;
      }
      return total;
    }, {});
    const res = await getOnlineFormDataInitProtocolData({
      protocolKey: checkTableCustomDataSource.joinModelKey,
      instId: instanceId,
    });
    const data = res?.data || [];

    checkTable2DList.forEach((checkInfo) => {
      const fieldMap = checkTableCustomFieldMap[checkInfo.rowSubFieldKey];
      if (fieldMap) {
        // 构建字段映射关系
        const keyMap = fieldMap.reduce((total, curr) => {
          total[curr.rightFieldKey] = curr.leftFieldKey;
          return total;
        }, {});
        checkInfo.checkDsData = [...(data || [])].map((item) => {
          return mapKeys(item, (v, k) => keyMap[k] ?? k);
        });
        checkInfo.rowCount = data?.length || 1;
        const cellId = checkInfo.cellId;
        const checkedTableTR = cloneRuntimeJson[cellId];
        const checkedTableTds = checkedTableTR.nextIds.map((id) => cloneRuntimeJson[id]);
        const insetRowCellIds = Array.from({ length: checkInfo.rowCount - 1 }).map((_, index) => {
          return `${cellId}_${index + 1}`;
        });
        const cellIndex = paper.nextIds.findIndex((id) => id === cellId);
        paper.nextIds.splice(cellIndex + 1, 0, ...insetRowCellIds);
        // 插入行数据

        insetRowCellIds.forEach((newCellId, index) => {
          const sql_index = index + 1;
          const newTr = cloneDeep(checkedTableTR);
          cloneRuntimeJson[newCellId] = {
            ...newTr,
            id: newCellId,
            nextIds: newTr.nextIds.map((tdId) => `${tdId}_${sql_index}`),
          };
          checkedTableTds.forEach((td) => {
            const newTdId = `${td.id}_${sql_index}`;
            cloneRuntimeJson[newTdId] = {
              ...cloneDeep(td),
              id: newTdId,
              preId: newCellId,
              cellWidget: td.cellWidget
                ? { ...td.cellWidget, id: `${td.cellWidget.id}_${sql_index}` }
                : undefined,
              cellCheckTableDataRowIdx: sql_index,
            };
          });
        });
      }
    });
  },
  /** 请求自定义数据源 */
  requestCustomSourceData: async (payload: {
    /** 纸张信息 */
    paper: any;
    /** 参数配置 */
    paramsConfig: any;
    /** 表单实例id */
    instanceId: string;
    /** 子表信息 */
    subTableInfo: Array<any>;
  }) => {
    const { paper, paramsConfig, instanceId = '', subTableInfo } = payload || {};
    const promises: any = [];

    if (!isEmpty(paper?.props?.customDataSource)) {
      const referenceMap = new Map(Object.entries(paramsConfig));

      for (const info of paper.props.customDataSource) {
        if (!info.joinModelKey) continue;
        let metaInfo, finalSQL, metaIpaas;

        if (info.joinModelType === JoinModelTypeEum.SqlModel) {
          finalSQL = sqlUtils.safeReplaceValues(info.joinSqlJson, referenceMap);
          console.log('finalSQL', finalSQL);
        } else if (info.joinModelType === JoinModelTypeEum.IpaasModel) {
          metaIpaas = {
            metaHeader: jsonSchemaUtils.parseJsonSchema(
              JSON.parse(info.joinIpaasConfig.metaHeader || '{}'),
              referenceMap,
            ),
            metaBody: jsonSchemaUtils.parseJsonSchema(
              JSON.parse(info.joinIpaasConfig.metaBody || '{}'),
              referenceMap,
            ),
            metaQuery: jsonSchemaUtils.parseJsonSchema(
              JSON.parse(info.joinIpaasConfig.metaQuery || '{}'),
              referenceMap,
            ),
            metaUri: jsonSchemaUtils.parseJsonSchema(
              JSON.parse(info.joinIpaasConfig.metaUri || '{}'),
              referenceMap,
            ),
          };
        } else if (info.joinModelType === JoinModelTypeEum.BuiltinModel) {
        } else if (info.joinModelType !== JoinModelTypeEum.FormModel) {
          metaInfo = await getModelMetaInfo({ id: info.joinModelKey });
        }

        // 产品信息单独请求
        if (metaInfo && metaInfo.type === 'RDO' && info.joinModelKey === 'em_product') {
          const promise = getOnlineFormInstanceGetRelatedProduct({
            id: instanceId,
          }).then((res: any) => {
            return transformUtils.getFormDataItem(info.onFieldMap, subTableInfo, {
              data: res ? [res] : [],
            });
          });

          promises.push(promise);
        } else if (info.joinModelType === JoinModelTypeEum.SqlModel) {
          if (finalSQL) {
            const promise = postDataSourceSelect({
              key: info.joinModelKey,
              sql: finalSQL,
            }).then((res: any) => {
              return transformUtils.getFormDataItem(info.onFieldMap, subTableInfo, {
                data: res ?? [],
              });
            });

            promises.push(promise);
          }
        } else if (info.joinModelType === JoinModelTypeEum.IpaasModel) {
          if (metaIpaas) {
            const promise = postIpaasWebhook({
              path: info.joinIpaasConfig.reqPath,
              httpMethod: info.joinIpaasConfig.reqMethod,
              headerParameters: metaIpaas.metaHeader,
              body: !isNil(metaIpaas.metaBody) ? JSON.stringify(metaIpaas.metaBody) : null,
              queryParameters: metaIpaas.metaQuery,
              uriParameters: metaIpaas.metaUri,
            }).then((res) => {
              console.log('haahahahahah res', res);

              const formDataItem = { ...cloneDeep(DEFAULT_FROM_STATE) };

              info.onFieldMap.forEach((item) => {
                if (item.subModel === 0) {
                  const mappedFields = jsonSchemaUtils.processJsonSchemaSubModel0(item, res);
                  merge(formDataItem, mappedFields);
                } else if (item.subModel === 1) {
                  const sInfo = subTableInfo.find((aa) => aa.field === item.subFieldKey) || {};

                  const fieldList = jsonSchemaUtils.processJsonSchemaSubModel1(item, res);

                  let fieldList2d;
                  if (
                    (sInfo.subTable2d && sInfo.key === 'dyn') ||
                    (sInfo.checkTable2d && sInfo.key === 'newfixed')
                  ) {
                    const emptyList = Array.from({ length: sInfo.childInitRowLen });

                    fieldList2d = fieldList
                      .map((fInfo) => {
                        const group_ = `${sInfo.key}${uuid2(16)}`;
                        return emptyList.map((_) => {
                          return {
                            ...fInfo,
                            group_,
                          };
                        });
                      })
                      .flat();
                  }

                  merge(formDataItem, {
                    [item.subFieldKey]: {
                      data: fieldList2d || fieldList,
                      dict: {},
                    },
                  });
                }
              });

              console.log('formDataItem', formDataItem);

              return formDataItem;
            });

            promises.push(promise);
          }
        } else if (info.joinModelType === JoinModelTypeEum.BuiltinModel) {
          //M08  MedPro写死的逻辑 - 用于检验表获取动态组件的服务数据，后续如果有其他内置模型需要类似的处理，可以考虑抽象出一个专门的方法来处理内置模型的数据请求和转换逻辑
          if (info.joinModelKey !== 'M08' || info.onFieldMap.find((i) => !i.isCheckTable)) {
            const res = await getOnlineFormDataInitProtocolData({
              protocolKey: info.joinModelKey,
              instId: instanceId,
            });
            const promise = transformUtils.getFormDataItem(info.onFieldMap, subTableInfo, res);
            promises.push(promise);
          }
        } else {
          const query = info.query.filter((item) => {
            if (!has(item, 'formKey')) return true;
            return referenceMap.has(item.formKey);
          });

          if (Array.isArray(query) && query.length !== 0) {
            const _query = info.query.reduce((prev, current) => {
              prev[current.exp] = referenceMap.get(current.formKey) ?? null;
              return prev;
            }, {});

            const foreignFields = info.onFieldMap
              .map((item) => {
                return item.fields.filter((item) => item.isFieldModel).map((kk) => kk.fieldLink);
              })
              .flat();

            const params = {};
            if (info.joinModelType === JoinModelTypeEum.FormModel) {
              Object.assign(params, {
                tmplId: info.joinFormRefId,
                subModel: info.joinSubModel,
              });
            } else {
              Object.assign(params, {
                modelCategory: 'entity',
              });
            }

            const promise = postOnlineFormBizBizServiceSummary({
              bsKey: metaInfo && metaInfo.type === 'RDO' ? 'rdoListAllVersion' : 'listAll',
              modelKey: info.joinModelKey,
              requestBody: {
                query: { ..._query },
                foreignFields: foreignFields,
              },
              ...params,
            }).then((res: any) => {
              return transformUtils.getFormDataItem(info.onFieldMap, subTableInfo, res);
            });

            promises.push(promise);
          }
        }
      }
    }
    return Promise.all(promises);
  },

  /** 初始化数据事件 */
  getEventInitDataLoad: async (payload: {
    /** 纸张信息 */
    paper: any;
    /** 参数配置 */
    paramsConfig: any;
    /** 渲染模式 */
    viewMode: RenderModeEnum;
    ofCtx: any;
  }) => {
    const { paper, paramsConfig, viewMode, ofCtx } = payload || {};

    if (viewMode === RenderModeEnum.FormMode && paper?.props?.javascript) {
      const codeInstance = setCodeRunner(paper.props.javascript, {}, ofCtx);
      if (codeInstance) {
        const __formState__ = await codeInstance.invoke('GCT_BUILT_IN_DATA_LOAD', {
          params: paramsConfig,
        });
        if (!isEmpty(__formState__)) {
          return transformSourceData(__formState__, {});
        }
      }
    }

    return {};
  },

  /** 设置字段事件 */
  setEventInstance: (payload: {
    /** 纸张信息 */
    paper: any;
    formState: any;
    /** 渲染模式 */
    viewMode: RenderModeEnum;
    ofCtx: any;
  }) => {
    const { paper, viewMode, ofCtx } = payload || {};
    if (paper?.props?.javascript && viewMode === RenderModeEnum.FormMode) {
      return setCodeRunner(paper.props.javascript, payload.formState, ofCtx);
    }
  },

  /** 转换formState */
  conversionFormState: (payload: {
    /** 默认值数据 */
    defaultData: any;
    /** 参数数据 */
    paramData?: any;
    /** 自定义数据源 */
    customData?: any;
    /** 初始化数据事件 */
    initEventData?: any;
    /** 渲染数据列表 */
    interfaceData: any;
    /** 子表信息 */
    subTableInfo: Array<any>;
    /** 渲染模式 */
    viewMode: any;
    /** 数据状态 */
    dataStatus: string | undefined;
    /** 物料消耗表的数据 */
    materialConsumeData?: any;
    /** 物料平衡表初始化数据 */
    balanceTableDataMaps?: any;
  }) => {
    const { interfaceData, subTableInfo, viewMode, dataStatus } = payload || {};

    // 数据是否处理过，如果处理过就不再走任何初始化逻辑
    const isDataProcessed = dataStatus === 'STASH' || dataStatus === 'SUBMIT';

    const formState = {
      ...cloneDeep(DEFAULT_FROM_STATE),
    };

    if (!isDataProcessed) {
      // 填报模式 初设默认值
      if (viewMode === RenderModeEnum.FormMode) {
        // 设置主表默认值
        merge(formState, payload.defaultData);
      }
      // 参数映射
      if (!isEmpty(payload.paramData)) {
        merge(formState, payload.paramData);
      }

      // 自定义数据源
      if (!isEmpty(payload.customData)) {
        // 没有拖入到表单模板中的子表字段，不需要 merge 到 formState 中
        const mergeKeys = [...(subTableInfo?.map((e) => e.field) || []), '_DICT', '_OPCT'];
        const shouldKeepField = (value, key) => {
          // 非对象字段，安全，直接合并
          if (!isObject(value)) return true;
          // 普通对象（非 { data: ... } 结构），直接合并
          if (!has(value, 'data')) return true;
          // 具有 { data: ... } 结构的对象字段，仅当 key 在 mergeKeys 中时才合并  认为是子表结构
          return mergeKeys.includes(key);
        };
        payload.customData.forEach((fromData2DataSource) => {
          merge(formState, pickBy(fromData2DataSource, shouldKeepField));
        });
      }

      // 初始化数据事件
      if (!isEmpty(payload.initEventData)) {
        merge(formState, payload.initEventData);
      }

      // 初始化物料消耗表
      if (!isEmpty(payload.materialConsumeData)) {
        merge(
          formState,
          Object.keys(payload.materialConsumeData).reduce((prev, key) => {
            prev[key] = transformSourceData2SubTable(payload.materialConsumeData[key]).map(
              (row) => {
                // 每行数据补充默认值
                return defaults(row, payload.defaultData[key]?.[0]);
              },
            );
            return prev;
          }, {}),
        );
      }
    }

    if (interfaceData && interfaceData.data) {
      merge(formState, transformSourceData(interfaceData.data, interfaceData.dict));
    }

    subTableInfo?.forEach((sInfo) => setSubTableFormState(viewMode, sInfo, formState));

    // 将拉到的最新的物料消耗数据，同步更新到平衡表中
    Object.entries(payload.balanceTableDataMaps).forEach(([key, data]) => {
      const originData = cloneDeep(formState[key]);
      formState[key] = data.reduce((list, e) => {
        const oldObj = originData.find((item) => item.material_id_ === e.product_id_) || {};
        list.push({
          ...oldObj,
          qty_consumed_: e.qty_consumed_,
          product_id_label: e.product_id_label,
          material_id_: e.product_id_,
        });
        return list;
      }, []);
    });
    return formState;
  },

  /** 添加子表行 */
  addSubTableRowItem: (payload) => {
    // 拿到子表的默认值 如果有快速填报 需要合并
    const subDefaultData = merge(
      {},
      renderUtils.getDefaultValueInfo({
        defaultDataMap: payload.defaultData,
        key: payload.subFieldId,
      }),
      {
        ...payload.quickFillData,
      },
    );

    const baseData = cloneDeep(DEFAULT_FROM_STATE);

    const rowData = { ...baseData };

    if (payload.isRowSubTable2d) {
      const groupKey = `dyn${uuid2(16)}`;

      const _2DTABLE_ = Array.from({ length: payload.childInitRowLen }, () => ({
        ...baseData,
        ...pick(subDefaultData, payload.crossFieldKeys),
      }));

      const extraData = { ...omit(subDefaultData, payload.crossFieldKeys) };

      Object.assign(rowData, {
        group_: groupKey,
        _2DTABLE_,
        ...extraData,
      });
    } else {
      Object.assign(rowData, subDefaultData);
    }

    return rowData;
  },

  /** 数据转成真实提交数据（二维表要平铺） */
  getSubmitFormData: (formData, paper: IPaper) => {
    const { subTable2DList = [], checkTable2DList = [] } = paper?.props || {};
    const list2D = [...subTable2DList, ...checkTable2DList];
    const filterKeys = ['_DICT', '_OPCT', '__FOREIGN__', '_MCTABLE'];
    const realFormData = Object.keys(formData).reduce((acc, fieldKey) => {
      const info = list2D.find(
        (item) => (item.subTable2d || item.checkTable2d) && item.rowSubFieldKey === fieldKey,
      );

      if (info) {
        const colSubTable = formData[info.colSubFieldKey]?.map((item) => ({
          [info.rowRefFieldKey]: item[info.colRefFieldKey],
        }));

        const arr = flatMap(formData[fieldKey], (row) =>
          zip(row['_2DTABLE_'], colSubTable)
            .map(([obj1, obj2]) => merge({}, obj1, obj2))
            .map((item) =>
              merge(
                pickBy(omit(row, filterKeys), (v) => !isNil(v)),
                pickBy(omit(item, filterKeys), (v) => !isNil(v)),
              ),
            ),
        ).map((item) => omit(item, '_2DTABLE_'));

        // 如果全是空数据，返回空数组；否则返回处理后的数据
        acc[fieldKey] = arr.every((item) => Object.keys(item).length === 1 && has(item, 'group_'))
          ? []
          : arr;
      } else if (Array.isArray(formData[fieldKey])) {
        // 如果是数组，过滤掉空数据项
        acc[fieldKey] = formData[fieldKey].map((item) =>
          Object.fromEntries(
            Object.entries(item).filter(([key, value]) => {
              // 1. 过滤掉指定的 key
              if (filterKeys.includes(key)) return false;
              // 2. 过滤掉以 _lb_ 结尾且值为 null 或 undefined 的 key
              if (key.endsWith('_lb_') && isEmpty(value)) return false;
              // 3. 保留其他
              return true;
            }),
          ),
        );
      } else {
        // 直接赋值非数组字段
        acc[fieldKey] = formData[fieldKey];
      }

      return acc;
    }, {});

    console.log('0506 数据转成真实提交数据（二维表要平铺）', realFormData);
    return omit(realFormData, filterKeys);
  },

  getFormDataIdsMap: (formData) => {
    const processEntry = (entry) => {
      if (Array.isArray(entry)) {
        const processed = entry.map(processEntry).filter(Boolean);
        return processed.length ? processed : undefined;
      }

      if (entry && typeof entry === 'object') {
        const result: any = {};

        // 保留当前层级的 id_
        if ('id_' in entry) {
          result.id_ = entry.id_;
        }

        // 递归处理其他属性
        for (const [key, value] of Object.entries(entry)) {
          if (key === 'id_') continue;
          const processed = processEntry(value);
          if (processed !== undefined) {
            result[key] = processed;
          }
        }

        return Object.keys(result).length ? result : undefined;
      }

      return undefined;
    };

    return processEntry(formData);
  },
};
