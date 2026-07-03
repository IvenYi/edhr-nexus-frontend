import { ref, watch, onUnmounted, nextTick } from 'vue';
import { ReportDataSetStepBI } from '@gct/runtime-web';
import { message } from 'ant-design-vue';
import {
  getBiFileDatasetConfigInfo,
  putBiFileDatasetConfigById,
  getBiFileDatasetConfigListDatasetid,
} from '/@/apis/gct-platform/FileDatasetConfigController';
import { uuid2 } from '/@/utils/uuid';
import { DataSetColType, fieldTypeEnum, sortTypeEnum, APIDataSetStep } from '../interface/type';
import { createSql, getValidSql, type FormulaJsonItem, getFieldString } from '../design/utils';
import { DataSourceType } from '/@bi-designer/enum/database';
// import { useNamespace } from '@gct/runtime';
import { useReportDataSetDesignStore } from '@gct/runtime-web';
import type { BiFileDatasetConfigResponse } from '/@/apis/gct-platform/model';
import { postFileDataPreview } from '/@/apis/gct-platform/FileUploadController';
import {
  postBiDataSet,
  putBiDataSetById,
  postBiDataSetPreview,
} from '/@/apis/gct-platform/BiDataSetController';
import {
  postDataset,
  putDatasetById,
  postDatasetRunScript,
  postDatasetGenColumn,
  postDatasetCreateRequest,
  postDatasetEditRequest,
} from '/@/apis/gct-platform/PnDatasetController';
import { formulaToJson } from '../design/utils';
import { cloneDeep } from 'lodash-es';

export function useDesignView(props, formRef, designViewRightRef) {
  // 页面状态
  const titleName = ref('');
  const open = ref<boolean>(false);
  const isChange = ref<boolean>(false);
  const isDsConfig = ref<boolean>(false);
  const databaseType = ref<DataSourceType>();
  const fileUrl = ref();
  const dataSource = ref<any>([]);
  const configData = ref<DataSetColType[]>();
  const scriptStr = ref('');
  const previewSql = ref();
  const configId = ref();
  const originConfigId = ref();
  const biConfigId = ref();
  const apiDatabaseId = ref();
  let datasetInfoCache: BiFileDatasetConfigResponse | null = null;
  // const { t } = useI18n();
  const store = useReportDataSetDesignStore();
  // 初始化数据集设计存储
  store.$reset();
  store.isBI = true;

  const wrongInfo = ref('');
  const apiStep = ref<APIDataSetStep>();
  const dataConfig = ref<any[]>([]);
  const hasDelKeys = ref([]);
  const isFieldAdd = ref(false);

  let newFields: Array<{
    json: FormulaJsonItem;
    sql: string;
    formula: string;
    key: string;
    name: string;
  }> = [];

  // const AggFunc = ['BI_AVG', 'BI_COUNT', 'BI_COUNTD', 'BI_MAX', 'BI_MEDIAN', 'BI_MIN', 'BI_SUM' ];
  const AggFunc = ['AVG', 'COUNT', 'COUNTD', 'MAX', 'MEDIAN', 'MIN', 'SUM'];

  // 验证连线配置是否通过
  async function validateLinkConfig(): Promise<boolean> {
    if (store.step === ReportDataSetStepBI.MODEL_CONFIG) {
      if (store.links && store.links.length > 0) {
        const valid = await store.validateLinks();
        return valid;
      }
    }
    return true;
  }

  // 验证属性配置是否通过
  async function validateFieldConfig(): Promise<boolean> {
    if (
      store.step === ReportDataSetStepBI.FIELD_CONFIG ||
      apiStep.value === APIDataSetStep.FIELD_CONFIG
    ) {
      const errors = await designViewRightRef.value?.fieldValid();
      if (errors && errors.length > 0) {
        let msgs: string[] = [];
        errors.forEach((errItem: any) => {
          if (errItem.errors && errItem.errors.length > 0) {
            msgs.push(...errItem.errors);
          }
        });
        msgs = Array.from(new Set(msgs)); // 去重
        if (msgs.includes('请输入显示名称')) {
          message.error('【显示名称】必填字段不能为空');
        } else if (msgs.includes('字段KEY重复，请重新输入')) {
          message.error('【字段KEY】重复，不允许填重复值');
        }
        return false;
      }
    }
    return true;
  }

  // 设置当前步骤
  async function onChangeStep(step: ReportDataSetStepBI) {
    if ((await validateLinkConfig()) !== true) {
      return;
    }
    if (step === ReportDataSetStepBI.FIELD_CONFIG && store.nodes.length === 0) {
      return;
    }
    if (step === ReportDataSetStepBI.DATASET_CONFIG) {
      if ((await validateFieldConfig()) !== true) {
        return;
      }
      if ((await validateLinkConfig()) !== true) {
        return;
      }
      if (store.nodes.length === 0) {
        return;
      }
    }
    store.step = step;
  }

  async function updateApiData() {
    if (apiDatabaseId.value === props.data.databaseId) {
      handleUpdateData(
        {
          dataSource: [],
          configData: dataConfig.value,
          hasSort: true,
        },
        true,
      );
    } else {
      await nextTick();
      designViewRightRef.value?.resetApiForm();
    }
  }

  /**
   * api数据源的step设置
   * @param step
   */
  async function onChangeApiStep(step: APIDataSetStep) {
    if (step === APIDataSetStep.DATASET_CONFIG) {
      if ((await validateFieldConfig()) !== true) {
        return;
      }
    }
    apiStep.value = step;
    if (apiStep.value === APIDataSetStep.DATASET_CONFIG) {
      updateApiData();
    }
  }

  // 下一步
  async function onNext(isDsConfig) {
    if (isDsConfig) {
      if ((await validateLinkConfig()) !== true) {
        return;
      }
      if (store.step === ReportDataSetStepBI.MODEL_CONFIG) {
        store.step = ReportDataSetStepBI.FIELD_CONFIG;
      } else if (store.step === ReportDataSetStepBI.FIELD_CONFIG) {
        if ((await validateFieldConfig()) !== true) {
          return;
        }
        if ((await validateLinkConfig()) !== true) {
          return;
        }
        store.step = ReportDataSetStepBI.DATASET_CONFIG;
      }
    } else {
      if (apiStep.value === APIDataSetStep.FIELD_CONFIG) {
        if ((await validateFieldConfig()) !== true) {
          return;
        }
        apiStep.value = APIDataSetStep.DATASET_CONFIG;
        updateApiData();
      }
    }
  }

  const handleRunConfig = (columns, configs, newLists?) => {
    const list = columns.map((item) => {
      const isAPI: boolean = databaseType.value == DataSourceType.API;
      let type, columnType;
      let fieldType = item.fieldType;
      const finds = configs.find((ele) => ele.fieldName == item.column.replace(/^["']|["']$/g, ''));
      if (finds) {
        fieldType = finds.fieldType;
      }
      if (!isAPI) {
        type = ['text', 'date'].includes(item.columnType!) ? 'dim' : 'meas';
        columnType = finds
          ? (type + finds.fieldType.split('_')[1]).toUpperCase()
          : (type + item.columnType).toUpperCase();
      }
      const fieldName = getFieldString(item.column);
      const newFieldMeta = newFields.find((i) => i.key === fieldName);
      const colName = item.alias || fieldName || '';
      const newName = fieldName.newFieldMeta?.name ?? colName?.split('.')?.at(-1);
      return {
        colName: (newLists ?? []).find((ele) => ele.fieldKey == item.column)?.fieldName ?? newName,
        fieldName,
        fieldType: isAPI || finds ? fieldType : fieldTypeEnum[columnType],
        type: isAPI || finds ? (finds?.type ?? type) : type,
        key: uuid2(16, 16),
        alias: item.alias,
        fieldSql: newFieldMeta?.sql ?? finds?.fieldSql ?? '',
        formula: newFieldMeta?.formula,
        originKey: isAPI ? item.originKey : undefined,
        isAggFunc: newFieldMeta?.json ? hasAggFunc(newFieldMeta?.formula) : undefined,
      };
    });
    if (configs?.length) {
      const newList = list.map((i) => {
        const findItem = configs.find((v) => v.fieldName == i.fieldName);
        return findItem?.fieldName
          ? { ...i, fieldName: findItem.fieldName, colName: findItem.colName }
          : i;
      });
      // const aggList = configs.filter(i => i.isAggFunc).filter(v => !hasDelKeys.value.includes(v.fieldName)) || [];
      //处理聚合方法字段不可存在于fullsql的问题，因此修改需要特殊处理 后面需要优化
      const newFieldKeys = newFields.map((i) => i.key);
      const aggList =
        configs
          .filter((i) => i.isAggFunc && !newFieldKeys.includes(i.fieldName))
          .filter((v) => !hasDelKeys.value.includes(v.fieldName)) || [];
      return [...newList, ...aggList];
    } else {
      return list;
    }
  };

  const handleApiConfig = (columns: any[], configs?: any[]) => {
    const list = columns?.map((item) => {
      const fieldName = getFieldString(item.fieldKey);
      const newFieldMeta = newFields.find((i) => i.key === fieldName);
      const colName = item.alias || fieldName || '';
      return {
        colName: newFieldMeta?.name || colName?.split('.')?.at(-1),
        fieldName,
        fieldType: item.fieldType,
        type: item.type,
        key: uuid2(16, 16),
        alias: item.alias,
        fieldSql: newFieldMeta?.sql,
        formula: newFieldMeta?.formula,
        originKey: item.originKey,
      };
    });

    if (configs?.length) {
      const newList = list?.map((i) => {
        const findItem = configs.find((v) => v.fieldName == i.fieldName);
        return findItem?.fieldName ? findItem : i;
      });
      //处理聚合方法字段不可存在于fullsql的问题，因此修改需要特殊处理 后面需要优化
      const newFieldKeys = newFields.map((i) => i.key);
      const aggList =
        configs
          .filter((i) => i.isAggFunc && !newFieldKeys.includes(i.fieldName))
          .filter((v) => !hasDelKeys.value.includes(v.fieldName)) || [];
      return [...newList, ...aggList];
    } else {
      return list;
    }
  };

  const getFullPreviewData = async () => {
    const res = await postBiDataSetPreview({
      pnDataset: { databaseId: formRef.value?.getData()?.databaseId },
      fullSql: getFullSql(),
    });
    return { rows: res?.sqlResult?.rows, columns: res?.sqlResult?.columns };
  };

  /**
   * api数据源的config设置
   * @param config
   */
  function updateApiDatabaseId(databaseId) {
    apiDatabaseId.value = databaseId;
    apiStep.value = APIDataSetStep.FIELD_CONFIG;
  }

  const getBiFileDatasetConfig = async (datasetId) => {
    const params = {
      datasetId: datasetId,
    };
    const res = (await getBiFileDatasetConfigInfo(params)) || {};
    if (res?.id) {
      originConfigId.value = res?.id;
      updateConfigId(res?.id);
    }
    datasetInfoCache = res;
    return res;
  };

  const updateConfigId = (id) => {
    if (!configId.value) {
      configId.value = id;
    }
  };

  // 校验是否含有聚合计算字段
  function hasAggFunc(code) {
    return AggFunc.some((func) => {
      // 正则确保匹配完整的函数调用（包含左括号），避免部分匹配
      const regex = new RegExp(`\\b${func}\\(`);
      return regex.test(code);
    });
  }

  const getFullSql = (): string | undefined => {
    const newFieldList = newFields.filter((i) => !hasAggFunc(i.formula)) || [];
    let newFieldSqls = [
      ...new Set([
        ...newFieldList.map((item) => item.sql),
        ...(configData.value ?? []).filter((i) => !i.isAggFunc).map((item) => item.fieldSql),
      ]),
    ].filter((item) => item);

    newFieldSqls = newFieldSqls.reduce((acc, current) => {
      // 检查当前id是否已存在
      if (!acc.some((item) => item.split('AS')[1] === current.split('AS')[1])) {
        acc.push(current);
      }
      return acc;
    }, []);
    const formData = formRef.value?.getData();

    if (newFieldSqls.length || newFields.length !== newFieldList.length) {
      if (databaseType.value == DataSourceType.FILE || databaseType.value == DataSourceType.API) {
        const db =
          databaseType.value == DataSourceType.FILE
            ? datasetInfoCache?.tableName?.toLowerCase()
            : scriptStr.value;
        const oldSql =
          'select ' +
          (configData.value ?? [])
            .filter((item) => !item.fieldSql)
            .map((item) => item.fieldName)
            .join(',') +
          ' from ' +
          db;
        return createSql(oldSql, newFieldSqls, datasetInfoCache?.dbType);
      } else {
        if (formData.type == 'SQL') {
          return createSql(getValidSql(scriptStr.value), newFieldSqls, datasetInfoCache?.dbType);
        } else if (formData.type == 'CONF') {
          return createSql(previewSql.value, newFieldSqls, datasetInfoCache?.dbType);
        }
      }
    } else {
      if (databaseType.value == DataSourceType.FILE || databaseType.value == DataSourceType.API) {
        return undefined;
      } else {
        if (formData.type == 'SQL') {
          return getValidSql(scriptStr.value);
        } else if (formData.type == 'CONF') {
          return previewSql.value;
        }
      }
    }
  };

  async function onInit(): Promise<void> {
    // 指定主键时加载数据
    if (biConfigId.value) {
      await store.load(biConfigId.value);
      store.updateX6Layout();
    } else {
      store.isNew = true;
      store.data.name = '未命名数据集名称';
    }
  }

  const updateChange = (type = undefined) => {
    isChange.value = true;
    //isDsConfig.value = false;
    console.log('type', type);
    type && (isDsConfig.value = type == 'CONF');
  };

  const updateDataPreview = async (datasetKey, hasSort = false) => {
    let data: any = { datasetKey };
    if (hasSort) {
      const sort = configData.value
        ?.filter((i) => [sortTypeEnum.ASC, sortTypeEnum.DESC].includes(i.sortType!))
        .map((v) => ({ sortField: v.fieldName, sortType: v.sortType }));
      const orderMap = {};
      configData.value
        ?.filter((i) => i.sortType == sortTypeEnum.CUSTOM)
        .forEach((v) => {
          orderMap[v.fieldName] = v.customSortArr;
        });
      data = {
        ...data,
        sorts: sort?.length ? sort : null,
        orderValues: Object.keys(orderMap).length ? orderMap : null,
      };
    }
    let dataSource: any = [];
    const formData = formRef.value?.getData();
    if (databaseType.value == DataSourceType.FILE) {
      dataSource =
        (await postFileDataPreview({
          ...data,
          fullSql: getFullSql(),
        })) || [];
    } else {
      if (formData.type == 'SQL' || databaseType.value == DataSourceType.API) {
        const res =
          (await postDatasetRunScript({
            ...data,
            ...formData,
            name: titleName.value,
            script: getValidSql(scriptStr.value),
            designSql: scriptStr.value,
            fullSql: getFullSql(),
          })) || {};
        dataSource = res?.rows;
      } else {
        // dataSource =
        //   (await postBiDataSetPreview({
        //     ...data,
        //     biConfigId: biConfigId.value,
        //     fullSql: getFullSql(),
        //   })) || [];
      }
    }
    return dataSource?.slice(0, 100);
  };

  const handleUpdateData = async (data, flag) => {
    const toDelKeys = data.configData?.filter((i) => i.deleted).map((item) => item.fieldName) ?? [];
    hasDelKeys.value = [...hasDelKeys.value, ...toDelKeys];
    // 删除新建状态的缓存数据
    newFields = newFields.filter((item) => toDelKeys.includes(item.key));
    configData.value = data?.configData
      .filter((i) => !i.deleted)
      .map((i) => ({
        ...i,
        colName: i.colName?.split('.')?.at(-1),
        key: i.key || uuid2(16, 16),
      }));
    fileUrl.value = data?.url;
    if (data.hasSort) {
      dataSource.value = await updateDataPreview(props.data?.key, true);
    } else {
      dataSource.value = data?.dataSource;
    }
    if (!flag) {
      updateChange();
    }
  };

  function getSrcConfig(rows, configs) {
    const list = Object.keys(rows?.[0] ?? {}).map((item) => {
      const newFieldMeta = newFields.find((i) => i.key === item);
      return {
        colName: newFieldMeta?.name || item?.split('.')?.at(-1) || '',
        fieldName: item || '',
        fieldType: fieldTypeEnum.DIMTEXT,
        type: 'dim',
        key: uuid2(16, 16),
        fieldSql: newFieldMeta?.sql,
        formula: newFieldMeta?.formula,
        isAggFunc: hasAggFunc(newFieldMeta?.formula),
      };
    });
    if (configs?.length) {
      const newList = list.map((i) => {
        const findItem = configs.find((v) => v.fieldName == i.fieldName);
        return findItem?.fieldName ? findItem : i;
      });
      //处理聚合方法字段不可存在于fullsql的问题，因此修改需要特殊处理 后面需要优化
      const newFieldKeys = newFields.map((i) => i.key);
      const aggList =
        configs
          .filter((i) => i.isAggFunc && !newFieldKeys.includes(i.fieldName))
          .filter((v) => !hasDelKeys.value.includes(v.fieldName)) || [];
      return [...newList, ...aggList];
    } else {
      return list;
    }
  }

  const onRun = async (hasConfig = false) => {
    open.value = false;
    const data = formRef.value?.getData();
    if (!scriptStr.value || !data.databaseId) {
      message.warning(!data.databaseId ? '请选择数据源' : '请输入SQL语句');
      return;
    }
    const res: any =
      (await postDatasetRunScript(
        {
          ...data,
          name: titleName.value,
          designSql: scriptStr.value,
          script: getValidSql(scriptStr.value),
          fullSql: getFullSql(),
        },
        { isTransformResponse: false },
      )) || {};
    if (res?.code == 211) {
      open.value = true;
      wrongInfo.value = res.subMessage;
      return;
    }
    dataSource.value = res?.data?.rows;
    if (!hasConfig) {
      configData.value = res.data?.columns?.length
        ? handleRunConfig(res.data?.columns, configData.value)
        : getSrcConfig(res.data?.rows, configData.value);
      // console.log('configData________', res.data?.columns);
      // API数据源公式字段为聚合函数时的处理
      const newFieldList = newFields.filter((i) => hasAggFunc(i.formula)) || [];
      const newFieldSqls = newFieldList?.map((item) => {
        return {
          colName: item.name || '',
          fieldName: item.key || '',
          fieldType: fieldTypeEnum.MEASNUMBER,
          type: 'meas',
          key: uuid2(16, 16),
          fieldSql: item?.sql,
          formula: item?.formula,
          isAggFunc: hasAggFunc(item?.formula),
        };
      });
      configData.value = [...configData.value, ...newFieldSqls];
    }
  };

  const getFieldMeta = (newField, res) => {
    const value = dataSource.value[newField.key];
    const fieldMeta: DataSetColType = {
      colName: newField.name ?? '',
      fieldName: newField.key ?? '',
      fieldType: value
        ? typeof value === 'number'
          ? fieldTypeEnum.MEASNUMBER
          : fieldTypeEnum.DIMTEXT
        : fieldTypeEnum.MEASNUMBER,
      type: value ? (typeof value === 'number' ? 'meas' : 'dim') : 'meas',
      key: uuid2(16, 16),
      fieldSql: res,
      formula: newField.formula,
      isAggFunc: hasAggFunc(newField.formula),
    };
    return fieldMeta;
  };

  const handleAddFormulaField = async (payload: { expr: string; name: string }) => {
    const fieldJson = formulaToJson(payload.expr);
    fieldJson.alias = 'calc' + Math.random().toString(36).substring(2, 6);

    // fieldJson.args?.forEach((ele) => {
    //   if (ele.name == 'NULLIF') {
    //     const regex = /NULLIF\(([^)]+)\)/i;
    //     const match = payload.expr.match(regex);
    //     ele.args = [
    //       {
    //         type: 'COLUMN',
    //         value: match ? match[1]?.replace(/\s+/g, '') : '',
    //       },
    //     ];

    //   }
    // });

    const res = await postDatasetGenColumn(fieldJson as any, {
      dbType: datasetInfoCache?.dbType ?? 'postgres',
      fileUpload:
        databaseType.value === DataSourceType.FILE || databaseType.value === DataSourceType.API,
    });

    const newField = {
      json: fieldJson,
      sql: res as string,
      formula: payload.expr,
      key: fieldJson.alias,
      name: payload.name,
    };
    newFields.push(newField);
    if (databaseType.value == DataSourceType.FILE) {
      dataSource.value = await updateDataPreview(props.data?.key, true);
      if (dataSource.value?.length && configData.value) {
        const fieldMeta = getFieldMeta(newField, res);
        configData.value.push(fieldMeta);
      }
    } else {
      const formData = formRef.value?.getData();
      if (formData.type == 'SQL' || databaseType.value == DataSourceType.API) {
        isFieldAdd.value = true;
        onRun();
      } else if (formData.type == 'CONF') {
        // 如果是CONF类型，直接更新configData
        const { rows } = await getFullPreviewData();
        dataSource.value = rows || [];
        if (configData.value) {
          const fieldMeta = getFieldMeta(newField, res);
          configData.value.push(fieldMeta);
        }
      }
    }
  };

  const handleDelFormulaField = ({ data }) => {
    const index = newFields.findIndex((ele) => ele.key == data.fieldName);
    if (index != -1) {
      newFields.splice(index, 1);
    }
  };

  const handleEditFormulaField = async (payload: {
    expr: string;
    name: string;
    fieldName: string;
  }) => {
    const fieldJson = formulaToJson(payload.expr);
    fieldJson.alias = payload.fieldName;
    const res = await postDatasetGenColumn(fieldJson as any, {
      dbType: datasetInfoCache?.dbType ?? 'postgres',
      fileUpload:
        databaseType.value === DataSourceType.FILE || databaseType.value === DataSourceType.API,
    });
    let newField: any = newFields.find((item) => item.key === payload.fieldName);
    const newFieldItem = {
      json: fieldJson,
      sql: res as string,
      formula: payload.expr,
      key: fieldJson.alias,
      name: payload.name,
    };
    if (newField) {
      Object.assign(newField, newFieldItem);
    } else {
      newField = newFieldItem;
      newFields.push(newField);
    }

    if (databaseType.value == DataSourceType.FILE) {
      const fieldMeta = (configData.value ?? []).find((item) => item.fieldName === newField.key);
      fieldMeta && (fieldMeta.fieldSql = res);
      dataSource.value = await updateDataPreview(props.data?.key, true);
      if (dataSource.value?.length && configData.value) {
        const newFieldMeta = getFieldMeta(newField, res);
        fieldMeta && Object.assign(fieldMeta, newFieldMeta);
      }
    } else {
      const formData = formRef.value?.getData();
      if (formData.type == 'SQL' || databaseType.value == DataSourceType.API) {
        isFieldAdd.value = true;
        onRun();
      } else if (formData.type == 'CONF') {
        const fieldMeta = (configData.value ?? []).find((item) => item.fieldName === newField.key);
        fieldMeta && (fieldMeta.fieldSql = res);
        // 如果是CONF类型，直接更新configData
        const { rows } = await getFullPreviewData();
        dataSource.value = rows || [];
        if (configData.value) {
          const newFieldMeta = getFieldMeta(newField, res);
          fieldMeta && Object.assign(fieldMeta, newFieldMeta);
        }
      }
    }
  };

  const handleDeploy = async (isApiDBChecked: boolean) => {
    const fields = configData.value?.map((i) => {
      return {
        fieldKey: i.fieldName,
        originKey: i.originKey,
        fieldType: i.fieldType,
        type: i.type,
      };
    });
    // API数据源修改时选择数据源后用isApiDBChecked表示
    if (!biConfigId.value || isApiDBChecked) {
      const res = await postDatasetCreateRequest(
        { fields },
        { datasourceId: formRef.value?.getData()?.databaseId },
      );
      dataSource.value = res?.slice(0, 100) || [];
    } else {
      const data = cloneDeep(designViewRightRef.value?.getApiForm());
      data.extrColumns = data.extrColumns?.join();
      await postDatasetEditRequest(data, { datasetId: props.data.id });
      dataSource.value = await updateDataPreview(props.data?.key, true);
    }
  };

  // 数据源配置保存
  const saveConfData = async (modalName, oldTitleName) => {
    const saveConfig: any = store.getSavaData();
    saveConfig.name = modalName || titleName.value || oldTitleName;
    if (biConfigId.value) {
      await putBiDataSetById({ id: biConfigId.value }, saveConfig);
    } else {
      biConfigId.value = await postBiDataSet(saveConfig);
    }
  };

  // API数据源配置保存
  const saveApiData = async (modalName, oldTitleName) => {
    const modelConfig = cloneDeep(designViewRightRef.value?.getApiForm());
    modelConfig.extrColumns = modelConfig.extrColumns?.join();
    const saveConfig: any = {
      name: modalName || titleName.value || oldTitleName,
      modelConfig: JSON.stringify(modelConfig),
    };
    saveConfig.fieldConfig = {
      fields: configData.value?.map((i) => ({ ...i, fieldKey: i.fieldName })),
    };
    if (biConfigId.value) {
      await putBiDataSetById({ id: biConfigId.value }, saveConfig);
    } else {
      biConfigId.value = await postBiDataSet(saveConfig);
    }
  };

  // 设置数据源配置的 configData
  const setConfPreview = async () => {
    const saveConfig: any = store.getSavaData();
    const cloneConfig = cloneDeep(saveConfig);
    delete cloneConfig.name;
    delete cloneConfig.models;
    // 第一次查询出新的previewSql
    const result = await postBiDataSetPreview({
      ...cloneConfig,
      pnDataset: { databaseId: formRef.value?.getData()?.databaseId },
    });
    previewSql.value = result?.previewSql || '';
    // dataSource.value = result?.sqlResult?.rows || [];
    // 第二次根据fullSql查询包括新增字段的所有预览数据
    const { rows, columns } = await getFullPreviewData();
    dataSource.value = rows || [];
    // const fields = cloneConfig.fieldConfig?.fields;
    configData.value = handleRunConfig(
      columns,
      configData.value,
      cloneConfig?.fieldConfig?.fields ?? [],
    );
  };

  // 设置API数据源配置的 configData
  const setApiConfPreview = async () => {
    const columns = designViewRightRef.value?.getApiFieldConfig();
    configData.value = handleApiConfig(columns, configData.value);
  };

  const handleUpdateDBType = (type) => {
    databaseType.value = type;
    if (type !== DataSourceType.API) {
      apiStep.value = undefined;
    } else {
      apiStep.value = APIDataSetStep.FIELD_CONFIG;
    }
    handleClearData();
  };

  const handleClearData = () => {
    dataSource.value = [];
    configData.value = [];
    designViewRightRef.value?.reloadEditor();
    fileUrl.value = '';
  };

  onUnmounted(() => {
    store.$reset();
  });

  watch(
    () => store.step,
    (val) => {
      if (val == ReportDataSetStepBI.DATASET_CONFIG) {
        setConfPreview();
      }
    },
  );

  watch(
    () => apiStep.value,
    (val) => {
      if (val == APIDataSetStep.DATASET_CONFIG) {
        setApiConfPreview();
      }
    },
  );

  return {
    titleName,
    store,
    isChange,
    originConfigId,
    databaseType,
    configId,
    biConfigId,
    isDsConfig,
    dataSource,
    configData,
    apiStep,
    apiDatabaseId,
    fileUrl,
    scriptStr,
    open,
    wrongInfo,
    dataConfig,
    onRun,
    onNext,
    onInit,
    onChangeStep,
    onChangeApiStep,
    getFullSql,
    getBiFileDatasetConfig,
    updateChange,
    updateConfigId,
    updateApiDatabaseId,
    saveConfData,
    saveApiData,
    handleDeploy,
    handleClearData,
    handleUpdateDBType,
    handleUpdateData,
    handleAddFormulaField,
    handleDelFormulaField,
    handleEditFormulaField,
    isFieldAdd,
  };
}
