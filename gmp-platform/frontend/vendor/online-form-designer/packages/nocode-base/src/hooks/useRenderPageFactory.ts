import { ref, watch, computed, provide } from 'vue';
import { cloneDeep, isEmpty, merge } from 'lodash-es';
import { uuid2, normalizeToArray, safeParseArray, mergeByMultiKey } from '../_utils_';
import {
  ComponentTypeEnum,
  RenderModeEnum,
  FormTypeEnum,
  PlatformEnum,
  BpmnNodeTypeEnum,
} from '../constant';
import { calcUtils, transformUtils, baseDataUtils, renderUtils } from '../interface';
import { validate as formValidate, clearFormRules } from './useValidator';
import { useLatestRequest } from '@vben/hooks';
import type { IPageData, IBasicInfoItem } from '../types';
import { FormTmplBomController } from './material-consume';
import { NCB_PROVIDE } from '../emit';
import { useMaterialBalance } from './material-balance/useMaterialBalance';
import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

interface IProps {
  /** 模板实例id或者模板id */
  selfId: string | string[] | undefined;
  /** 批次号 */
  materialNo?: string;
  /** 查询条件 */
  query?: Record<string, any>;
}

interface ITemplatePayload {
  /** 渲染模式类型 */
  renderModeType?: RenderModeEnum;
}

interface IInstancePayload {
  /** 是否是详情页面 */
  isDetailPage?: boolean | Function;
  /** 获取按钮显示规则 */
  getBtnDisplayRules?: boolean | Function;
  /** 组件传进来的参数 */
  paramExtraProps?: Record<string, any>;
}

interface IDeviceConfig {
  /** 默认的用户id */
  defaultUserId: string | undefined;
  /** 默认的部门id */
  defaultOrgId: string | undefined;
  /** 默认的物料查询条件 */
  defaultProductSearchFields: string;
}

interface IPayload extends ITemplatePayload, IInstancePayload {
  /** 工厂类型 */
  factoryType: 'template' | 'instance' | 'batchInstance' | 'batchTemplate';
  /** 请求接口函数 */
  requestCallback: Function;
  /** 平台参数类型 */
  platformType: PlatformEnum;
  /** 是否是模拟填报 */
  isMockReport: boolean;
  /** 设备配置信息 */
  deviceConfig?: IDeviceConfig;
  /**所有数据更新加载完后 */
  onFinisher?: Function;
  /**表单打印方法 */
  formPrint?: Function;
  /** 初始化加载数据之后 */
  afterProcessData?: Function;
}

export function useRenderPageFactory(props: IProps, payload: IPayload) {
  const counter = ref(0);
  const finisher = ref(0);
  /** 单据模板数据map */
  const dataCenterMap = ref<Record<string, any>>({});
  /** 分页信息map */
  const pageDataMap = ref<Record<string, IPageData[]>>({});
  /** 数据信息map */
  const formStateMap = ref<Record<string, Record<string, any>>>({});
  /** 单据模板字段默认值map */
  const defaultDataMap = ref<Record<string, any>>({});
  /** 基础信息列表 */
  const basicInfoList = ref<IBasicInfoItem[]>([]);
  /** 实例信息列表（主要是用来节约接口请求） */
  const selfInfoList = ref<any>([]);
  /** bom信息控制器 */
  const tmplBomCMap = ref<Record<string, FormTmplBomController>>({});
  provide(NCB_PROVIDE.TMPL_BOM_CONTROLLER_MAP, tmplBomCMap);

  const { getConsumeData } = useMaterialBalance();

  const callbackName = {
    template: requestTemplateInfo,
    instance: requestSelfInfo,
    batchInstance: requestBatchSelfInfo,
    batchTemplate: requestBatchTemplateInfo,
  };

  const {
    run: runFetchInstances,
    invalidate: invalidateFetch,
    loading: fetchLoading,
  } = useLatestRequest(async (ids: string[]) => {
    return await processInstances(ids);
  });

  watch(
    [() => props.selfId, () => counter.value],
    async ([newRequestId, _]) => {
      console.log('aaaaaaaaaa', newRequestId);
      if (isEmpty(newRequestId)) {
        // 如果不存在也需要情况，因为会有上次的缓存
        invalidateFetch();
        clear();
        return;
      }

      const ids = Array.isArray(newRequestId) ? newRequestId : [newRequestId];

      const response = await runFetchInstances(ids);
      if (!response) {
        console.log('旧请求的返回，忽略', newRequestId);
        return;
      }

      clear(); // 清空之前的结果

      response?.forEach((res) => {
        if (res) {
          Object.assign(dataCenterMap.value, res.dataCenter);
          Object.assign(defaultDataMap.value, res.defaultData);
          Object.assign(pageDataMap.value, res.pageData);
          Object.assign(formStateMap.value, res.formState);
          Object.assign(tmplBomCMap.value, res.tmplBomC);
          basicInfoList.value.push(res.basicInfo);
          selfInfoList.value.push(res.selfInfo);
        }
      });

      console.log(
        'tangjian dataCenterMap:',
        dataCenterMap.value,
        'defaultDataMap:',
        defaultDataMap.value,
        'pageDataMap:',
        pageDataMap.value,
        'formStateMap:',
        formStateMap.value,
        'basicInfoList:',
        basicInfoList.value,
        'selfInfoList:',
        selfInfoList.value,
        'tmplBomCMap:',
        tmplBomCMap.value,
      );

      finisher.value++;
    },
    { immediate: true },
  );

  watch(
    () => finisher.value,
    () => {
      console.log('请求成功');
      const selfId = props.selfId!;
      if (payload.onFinisher) {
        const info = findBasicInsInfo(selfId);
        payload.onFinisher && payload.onFinisher(props.selfId, info?.renderModeType);
      }
    },
  );

  const hasData = computed(() => {
    return basicInfoList.value.length !== 0;
  });

  function getInfo2Self(selfInfo) {
    let bpmnType;
    let fillModeType = RenderModeEnum.ViewMode; // 表单填报渲染模式
    let btnModelType = RenderModeEnum.ViewMode; // 按钮渲染模式
    let bpmnFieldAuthMap = {};

    // 确定表单模式
    if (selfInfo.formType === FormTypeEnum.BASE || selfInfo.formType === FormTypeEnum.FILE) {
      // 先考虑实例状态，因为已经不走暂存逻辑，永远都是SUBMIT
      if (selfInfo.instanceStatus) {
        fillModeType =
          selfInfo.instanceStatus === 'UNFILLED' ||
          selfInfo.instanceStatus === 'STASH' ||
          selfInfo.instanceStatus === 'PARTIAL_SUBMIT'
            ? RenderModeEnum.FormMode
            : RenderModeEnum.ViewMode;

        btnModelType = fillModeType;
      } else {
        fillModeType =
          selfInfo.dataStatus === 'SUBMIT' ? RenderModeEnum.ViewMode : RenderModeEnum.FormMode;
        btnModelType = fillModeType;
      }

      bpmnFieldAuthMap = renderUtils.getBpmnFieldAuthMap(
        renderUtils.deduplicateFields(safeParseArray(selfInfo.processFieldPermission)),
      );
    } else if (selfInfo.formType === FormTypeEnum.PROCESS) {
      const { nodeDef = {} } = selfInfo.ofProcessOperations ?? {};
      bpmnType =
        selfInfo.instanceStatus === 'ABANDON'
          ? BpmnNodeTypeEnum.BpmnEnd
          : (nodeDef.type ?? BpmnNodeTypeEnum.BpmnEnd);
      fillModeType =
        bpmnType === BpmnNodeTypeEnum.BpmnEnd ? RenderModeEnum.ViewMode : RenderModeEnum.FormMode;
      btnModelType = fillModeType;
      bpmnFieldAuthMap = renderUtils.getBpmnFieldAuthMap(
        mergeByMultiKey(
          renderUtils.deduplicateFields(safeParseArray(nodeDef.fieldConfig)),
          renderUtils.deduplicateFields(safeParseArray(selfInfo.processFieldPermission)),
          {
            keyFields: ['modelKey', 'field'],
            fieldsToMerge: ['readonly', 'edit'],
            isAllowMerge: bpmnType === BpmnNodeTypeEnum.BpmnSubmit, // 只有开始节点可以合并字段权限配置
            isConcat: true,
          },
        ),
      );
    }

    // 如果是详情页强制只读
    const _isDetailPage_ =
      typeof payload.isDetailPage === 'function' ? payload.isDetailPage() : payload.isDetailPage;

    if (_isDetailPage_) {
      fillModeType = RenderModeEnum.ViewMode;
      // 按钮是否需要强制只读
      const isForceShowBtn =
        typeof payload.getBtnDisplayRules === 'function' ? payload.getBtnDisplayRules() : false;
      if (!isForceShowBtn) {
        btnModelType = fillModeType;
      }
    }

    // 合并参数配置
    const paramsConfig = {
      ...JSON.parse(selfInfo.params || '{}'),
      ...(payload.paramExtraProps || {}),
    };

    // 是否开启动态行高配置 如果开启的话 页面强制成只读
    if (paramsConfig?._gct_useDynRowHeight_) {
      fillModeType = RenderModeEnum.ViewMode;
      btnModelType = fillModeType;
    }

    // 构造查询参数
    /**
     * businessId 业务ID
     * businessType 业务类型
     * materialNo 物料编号
     * materialStatus 物料形态(批次或SN)
     * params 实例参数(业务扩展属性)
     */

    const query = selfInfo.dataId
      ? {
          id_: selfInfo.dataId,
          _gct_dataStatus_: selfInfo.dataStatus,
          _gct_formChangeApprovalInfo_: {
            isSupport:
              selfInfo.instanceStatus === 'IN_AUDIT' &&
              paramsConfig?._gct_is_form_change_approval_page_, // 表单是审核状态并且是表单审核页面
            id_: paramsConfig?._gct_change_business_id,
            change_no_: paramsConfig?._gct_change_business_code_,
          },
        }
      : {};

    return {
      bpmnType,
      fillModeType,
      btnModelType,
      bpmnFieldAuthMap,
      paramsConfig,
      query,
    };
  }

  /** 查询实例信息 */
  async function requestSelfInfo(id: string) {
    const selfInfo = await payload.requestCallback({
      id,
      ...payload.paramExtraProps?._gct_nocode_inst_query_params_,
    });

    if (isEmpty(selfInfo)) return;

    const { bpmnType, fillModeType, btnModelType, bpmnFieldAuthMap, paramsConfig, query } =
      getInfo2Self(selfInfo);

    return {
      id,
      tid: selfInfo.tmplId,
      selfInfo,
      bpmnType,
      fillModeType,
      btnModelType,
      bpmnFieldAuthMap,
      paramsConfig,
      query,
    };
  }

  /** 查询模板信息 */
  async function requestTemplateInfo(id: string) {
    const selfInfo = await payload.requestCallback({ id });
    if (isEmpty(selfInfo)) return;
    const { baseId, id: tmpId } = selfInfo;
    return {
      id,
      tid: baseId ? `${baseId}:${id}` : tmpId,
      selfInfo,
      fillModeType: payload.renderModeType,
      btnModelType: payload.renderModeType,
      query: props.query ?? {},
    };
  }

  /** 查询实例信息列表 */
  async function requestBatchSelfInfo(ids: string[]) {
    try {
      const selfInfos = await payload.requestCallback(ids);

      if (selfInfos && selfInfos.length) {
        return selfInfos.map((selfInfo) => {
          const { bpmnType, fillModeType, btnModelType, bpmnFieldAuthMap, paramsConfig, query } =
            getInfo2Self(selfInfo);
          return {
            tid: selfInfo.tmplId,
            selfInfo,
            bpmnType,
            fillModeType,
            btnModelType,
            bpmnFieldAuthMap,
            paramsConfig,
            query,
          };
        });
      }
      return [];
    } catch (error) {
      console.error('Error in requestBatchSelfInfo:', error);
      return [];
    }
  }

  async function requestBatchTemplateInfo(id: string) {
    try {
      const res = await payload.requestCallback({
        materialNo: props.materialNo,
        ofTmplId: id?.[0], // 在线表单模板id
      });

      if (res && res.ofInstances && res.ofInstances.length !== 0) {
        return res.ofInstances.map((selfInfo) => {
          const { query } = getInfo2Self(selfInfo);
          const { baseId, id: tmpId } = selfInfo;
          return {
            id,
            tid: selfInfo.tmplId || (baseId ? `${baseId}:${id}` : tmpId),
            selfInfo: {
              ...selfInfo,
              runtimeJson: res.ofTmpl.runtimeJson,
            },
            fillModeType: payload.renderModeType,
            btnModelType: payload.renderModeType,
            query,
          };
        });
      }
      return [];
    } catch (error) {
      console.error('Error in requestBatchTemplateInfo:', error);
      return [];
    }
  }

  /** 统一获取实例数据 */
  async function getInstanceData(ids: string[]) {
    const requestName = callbackName[payload.factoryType];
    if (payload.factoryType === 'batchInstance' || payload.factoryType === 'batchTemplate') {
      // 批量查询实例信息
      const batchResults = await requestName(ids);
      return batchResults;
    } else {
      // 单个请求，逐个调用 requestName
      return await Promise.all(
        ids.map(async (id: string) => {
          const result = await requestName(id);
          return { id, ...result };
        }),
      );
    }
  }

  /**
   * 统一处理数据流程
   */
  async function processInstances(ids: string[]): Promise<any[]> {
    try {
      const instanceDataList = await getInstanceData(ids);
      // 使用 Promise.all 并行处理每个实例
      return await Promise.all(
        instanceDataList.map(async (data: any) => {
          // 对于单个请求情况，可能 data 中已经包含 id 字段；对于批量请求，使用 selfInfo.id
          const id = data.selfInfo ? data.selfInfo.id : data.id;
          console.log('Processing instance with id:', id);
          return await processData(id, data);
        }),
      );
    } catch (error) {
      console.error('Error processing instances:', error);
      return [];
    }
  }

  /**
   * 统一处理（从模板或实例）请求到数据
   * @param id
   * @param result
   * @return {*}
   */
  async function processData(id: string, result) {
    if (isEmpty(result)) return;
    console.log('Processing data for id:', result);
    const { selfInfo, paramsConfig, fillModeType } = result || {};
    const cloneRuntimeJson = cloneDeep(JSON.parse(selfInfo?.runtimeJson || '{}'));
    const paper = cloneRuntimeJson[ComponentTypeEnum.PAPER];
    if (paper) {
      // 获取动态表数据 检验表初始化业务逻辑
      await transformUtils.requestCheckDsData({
        paper,
        instanceId: id,
        cloneRuntimeJson,
      });
    }
    const subTableInfo = transformUtils.getSubTableInfo(paper);
    // 获取字段信息集合
    const fieldInfoMap = await renderUtils.getFieldsByDataCenter(
      cloneRuntimeJson,
      paramsConfig?._gct_useDynRowHeight_,
    );

    let balanceTableDataMaps: object = {};
    // 处理物料消耗表相关
    const tmplBomC = new FormTmplBomController();
    // 填报的时候才判断
    if (fillModeType === RenderModeEnum.FormMode) {
      tmplBomC.judgeScene({ cloneRuntimeJson, selfInfo });

      // 只有填报的时候去拉取最新的物料消耗数据
      balanceTableDataMaps = await getConsumeData({
        cloneRuntimeJson,
        operationId: paramsConfig?.routingOperationId,
        materialNo: paramsConfig?.materialNo || selfInfo.materialNo,
        // relatedLotNo: paramsConfig?.relatedLotNo,
      });
    }
    await tmplBomC.init({
      formInstBom: selfInfo.formInstBom,
      operationId: paramsConfig?.routingOperationId,
      materialNo: paramsConfig?.materialNo || selfInfo.materialNo,
      // relatedLotNo: paramsConfig?.relatedLotNo,
    });
    const materialConsumeData = tmplBomC.calcFormState(paper);

    // 提前设置字段请求信息
    await renderUtils.setRequestInfo2DataCenter(
      cloneRuntimeJson,
      fieldInfoMap.modelKeyList,
      payload.platformType,
      payload.isMockReport,
      selfInfo.formType,
      paramsConfig,
      fieldInfoMap.useSignFields,
      fieldInfoMap.useClsReasonDataLink,
      fieldInfoMap.useClsGroupDataLink,
      tmplBomC,
    );

    // 请求物料和工序的数据信息
    const [operationData, productData, mfgOrderData] = await renderUtils.fetchMultipleModelData([
      {
        modelKey: 'em_routing_operation',
        bsKey: 'getById',
        params: { id: paramsConfig?.routingOperationId },
      },
      {
        modelKey: 'em_product',
        bsKey: 'rdoGetVersionById',
        params: { id: paramsConfig?.productId },
      },
      {
        modelKey: 'em_mfg_order',
        bsKey: 'getOne',
        api: postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
        params: { code_: paramsConfig?.mfgOrderCode },
      },
    ]);

    // 获取默认值映射
    const defaultDataMap = renderUtils.getDefaultValueMapByField({
      defaultValueFields: fieldInfoMap.useDefaultValueFields,
      mainMaterialNo: paramsConfig?.materialNo || selfInfo.materialNo,
      mainRelatedLotNo: paramsConfig?.relatedLotNo,
      mainProductName: paramsConfig?.productId,
      mainRoutingOperation: paramsConfig?.routingOperationId,
      mainMfgOrderId: paramsConfig?._gct_nocode_mfg_order_id_ || paramsConfig?.mfgOrderCode,
      defaultUserId: payload?.deviceConfig?.defaultUserId,
      defaultOrgId: payload?.deviceConfig?.defaultOrgId,
      operationData,
      productData,
      mfgOrderData,
    });

    console.log('defaultDataMap', defaultDataMap);
    tmplBomC.handleDefaultMap(defaultDataMap);

    // 计算默认值
    const defaultData = transformUtils.getDefaultData({
      defaultDataMap,
      subTableInfo,
      viewMode: result.fillModeType,
    });

    console.log('defaultData', defaultData);

    let paramData, customData, initEventData;
    try {
      if (payload.platformType === PlatformEnum.INTEGRATION_PAAS_SI && !payload.isMockReport) {
        // 获取参数映射、自定义数据源和初始化事件数据
        [paramData, customData, initEventData] = await Promise.all([
          transformUtils.getParamData({
            paper,
            paramsConfig,
            subTableInfo,
            fieldPermission: JSON.parse(selfInfo.processFieldPermission || '[]') || [],
          }),
          transformUtils
            .requestCustomSourceData({
              paper,
              paramsConfig,
              instanceId: id,
              subTableInfo,
            })
            .catch((e) => {
              console.error('Error in requestCustomSourceData:', e);
              return null;
            }),
          transformUtils
            .getEventInitDataLoad({
              paper,
              paramsConfig,
              viewMode: result.fillModeType,
              ofCtx: {
                formPrint: payload.formPrint,
                id: result.id,
                tid: result.tid,
                updatePageData,
                findBasicInsInfo,
                findFormInsInfo,
              },
            })
            .catch((e) => {
              console.error('Error in getEventInitDataLoad:', e);
              return null;
            }),
        ]);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }

    // 请求接口数据
    const interfaceData = await baseDataUtils.requestRenderData({
      info: selfInfo,
      fetchConfig: { _gct_materialNo_: props.materialNo || selfInfo.materialNo },
      queryConfig: result.query,
      foreignFields: fieldInfoMap.foreignFields,
      subModelFields: fieldInfoMap.subModelFields,
      isMockReport: payload.isMockReport,
    });

    // 转换formState
    const formState = transformUtils.conversionFormState({
      defaultData,
      paramData,
      customData,
      initEventData,
      interfaceData,
      subTableInfo,
      viewMode: result.fillModeType,
      dataStatus: selfInfo.dataStatus,
      materialConsumeData,
      balanceTableDataMaps,
    });

    if (payload.afterProcessData && typeof payload.afterProcessData === 'function') {
      payload.afterProcessData(formState);
    }

    const eventInstance = transformUtils.setEventInstance({
      paper,
      formState,
      viewMode: result.fillModeType,
      ofCtx: {
        formPrint: payload.formPrint,
        id: result.id,
        tid: result.tid,
        updatePageData,
        findBasicInsInfo,
        findFormInsInfo,
      },
    });
    // 分页信息
    const pageData =
      selfInfo.formType === FormTypeEnum.FILE
        ? []
        : calcUtils.initCalc(cloneRuntimeJson, formState);

    console.log('LXM::运行时处理的数据', pageData);

    const tid = result.tid;
    const uniqueId = `${tid}_${uuid2(8)}`;

    const updates = {
      dataCenter: { [uniqueId]: cloneRuntimeJson },
      defaultData: { [uniqueId]: defaultDataMap },
      pageData: { [uniqueId]: pageData },
      formState: { [uniqueId]: formState },
      tmplBomC: { [uniqueId]: tmplBomC },
      basicInfo: {
        key: id,
        tid,
        uniqueId,
        modelKey: selfInfo.modelKey!,
        formType: selfInfo.formType ?? FormTypeEnum.BASE,
        platformType: payload.platformType,
        isMockReport: payload.isMockReport,
        renderModeType: result.fillModeType,
        btnRenderModeType: result.btnModelType,
        bpmnType: result.bpmnType,
        bpmnFieldAuthMap: result.bpmnFieldAuthMap,
        gct_stashData: result.query?._gct_dataStatus_ === 'STASH',
        eventInstance,

        formChangeStatus: false,
        formChangeOriginData: {},
        formChangeNewData: {},
        annSwitchStatus: false,
        annCellLocationList: [],
        annSelectId: undefined,
        validatorLocationList: [],
        validatorMessageMap: {},
        mobileTdIdGroups: fieldInfoMap.tdIdGroups,
        mobileSelectTdId: undefined,
        contentHighlight:
          paramsConfig?._gct_nocode_of_instance_id_ === props.selfId
            ? {
                [ComponentTypeEnum.Trace]: normalizeToArray(
                  paramsConfig?._gct_nocode_trace_values_,
                ),
              }
            : {},
        productSearchFields: payload?.deviceConfig?.defaultProductSearchFields,
      },
      selfInfo: {
        ...selfInfo,
        newBackupInfo: {
          foreignFields: fieldInfoMap.foreignFields,
          subModelFields: fieldInfoMap.subModelFields,
          appendixFields: fieldInfoMap.useAppendixFields,
          subTableInfo,
        },
      },
    };
    return updates;
  }

  function clear() {
    clearFormRules();
    dataCenterMap.value = {};
    pageDataMap.value = {};
    // formStateMap.value = {};
    // defaultDataMap.value = {};

    Object.keys(formStateMap.value).forEach((key) => {
      delete formStateMap.value[key];
    });

    Object.keys(defaultDataMap.value).forEach((key) => {
      delete defaultDataMap.value[key];
    });

    basicInfoList.value = [];
    selfInfoList.value = [];
  }

  /** 根据标识查询表单相关信息 */
  const findFormInsInfo = (id: string) => {
    return selfInfoList.value.find((item) => item.id === id);
  };

  /** 根据标识查询当前页面基础信息 */
  const findBasicInsInfo = (id: string) => {
    return basicInfoList.value.find((item) => item.key === id || item.tid === id);
  };

  /** 更新分页信息 */
  const updatePageData = (uniqueId: string) => {
    console.log('tangjianaaaa', cloneDeep(formStateMap.value[uniqueId]));
    pageDataMap.value[uniqueId] = calcUtils.initCalc(
      dataCenterMap.value[uniqueId],
      formStateMap.value[uniqueId],
    );
  };

  /** 更新渲染模式 */
  const updateRenderModeType = (
    uniqueId: string,
    newRenderModeType: RenderModeEnum,
    updateButton: boolean = false,
  ) => {
    basicInfoList.value.forEach((info) => {
      if (info.uniqueId === uniqueId) {
        info.renderModeType = newRenderModeType;
        if (updateButton) {
          info.btnRenderModeType = newRenderModeType;
        }
      }
    });
  };

  /** 表单校验 */
  async function validate(showMsg, uniqueId, notifyCallback) {
    const formState = formStateMap.value?.[uniqueId];
    const dataCenter = dataCenterMap.value?.[uniqueId];
    const bomC = tmplBomCMap.value?.[uniqueId];
    const res = await formValidate(
      formState,
      dataCenter[ComponentTypeEnum.PAPER],
      showMsg,
      notifyCallback,
    );
    await bomC.submitValidate(showMsg, notifyCallback);
    return res;
  }

  /** 获取formState */
  const getFormState = (uniqueId) => {
    const formState = formStateMap.value?.[uniqueId];
    const dataCenter = dataCenterMap.value?.[uniqueId];

    return transformUtils.getSubmitFormData(
      cloneDeep(formState),
      dataCenter[ComponentTypeEnum.PAPER],
    );
  };

  /** 设置成编辑状态 */
  const setFromEditStatus = async (uniqueId) => {
    payload.onFinisher && payload.onFinisher(props.selfId, RenderModeEnum.FormMode);
    basicInfoList.value.forEach((info) => {
      if (info.uniqueId === uniqueId) {
        info.renderModeType = RenderModeEnum.FormMode;
        info.formChangeStatus = true;
        info.formChangeOriginData = cloneDeep(formStateMap.value?.[uniqueId]);
        info.formChangeNewData = {};
      }
    });

    return true;
  };

  /**
   * 设置批注查看状态
   * @param status 开启或关闭
   * @param config 批注单元格坐标数组
   */
  const setAnnotationViewStatus = (uniqueId, status, config) => {
    basicInfoList.value.forEach((info) => {
      if (info.uniqueId === uniqueId) {
        info.annSwitchStatus = status;
        info.annCellLocationList = status ? cloneDeep(config) : [];
        info.annSelectId = undefined;
      }
    });

    return true;
  };

  /**
   * 设置字段校验显示
   * @param config 字段校验信息集合
   */
  const setValidatorViewStatus = (uniqueId, config) => {
    basicInfoList.value.forEach((info) => {
      if (info.uniqueId === uniqueId) {
        info.validatorLocationList = Object.keys(config);
        info.validatorMessageMap = config;
      }
    });

    return true;
  };

  /** 获取操作记录数据map */
  const getAnnotationContentList = (uniqueId, options = {}) => {
    const info = basicInfoList.value.find((item) => item.uniqueId === uniqueId);

    const data = info ? cloneDeep(info.formChangeNewData) : {};
    basicInfoList.value.forEach((info) => {
      if (info.uniqueId === uniqueId) {
        info.renderModeType = RenderModeEnum.ViewMode;
        info.formChangeStatus = false;
        info.formChangeOriginData = {};
        info.formChangeNewData = {};
      }
    });

    return Object.values(data).map((item: any) => {
      return {
        ...item,
        ...options,
      };
    });
  };

  /** 自动保存使用 - 快速查询渲染数据 */
  const quickSearchRenderData = async (uniqueId, currentSelfInfo) => {
    // 可能实例是老的了，所以要重新查询
    const selfInfo = await payload.requestCallback({ id: currentSelfInfo.id });
    // 请求接口数据
    const interfaceData = await baseDataUtils.requestRenderData({
      info: currentSelfInfo,
      fetchConfig: { _gct_materialNo_: props.materialNo || selfInfo.materialNo },
      queryConfig: selfInfo.dataId ? { id_: selfInfo.dataId } : {},
      foreignFields: currentSelfInfo.newBackupInfo.foreignFields,
      subModelFields: currentSelfInfo.newBackupInfo.subModelFields,
      isMockReport: false,
    });

    // 转换formState
    const newFormState = transformUtils.conversionFormState({
      defaultData: {},
      interfaceData,
      subTableInfo: currentSelfInfo.newBackupInfo.subTableInfo,
      viewMode: RenderModeEnum.ViewMode,
      dataStatus: selfInfo.dataStatus,
    });

    const idsFormState = transformUtils.getFormDataIdsMap(newFormState);

    merge(formStateMap.value?.[uniqueId], idsFormState);
  };

  /** 获取附件信息 */
  const getAppendixInfos = (uniqueId, currentSelfInfo, types: any = []) => {
    const formState = formStateMap.value?.[uniqueId];

    const list: string[] = (currentSelfInfo.newBackupInfo.appendixFields || [])
      .filter((item) => !types.length || types.includes(item.fieldType))
      .flatMap((item) => {
        if (item.subModelKey && item.subFieldKey) {
          const subList = formState?.[item.subFieldKey];
          if (Array.isArray(subList)) {
            return subList.flatMap((subItem) =>
              (subItem?.[item.fieldId] || '').split(',').filter(Boolean),
            );
          }
          return [];
        } else {
          const value = formState?.[item.fieldId];
          return (value || '').split(',').filter(Boolean);
        }
      });

    return list;
  };

  /** 获取文件表单PDF信息 */
  const getPdfInfos = (uniqueId) => {
    const formState = formStateMap.value?.[uniqueId];
    const fieldId = 'file_';
    const modelValue = formState?.[fieldId];
    return modelValue ? modelValue.split(',') : [];
  };

  return {
    counter,
    finisher,
    loading: fetchLoading,
    dataCenterMap,
    pageDataMap,
    formStateMap,
    defaultDataMap,
    basicInfoList,
    selfInfoList,
    tmplBomCMap,
    hasData,

    findFormInsInfo,
    findBasicInsInfo,
    updatePageData,
    updateRenderModeType,
    validate,
    getFormState,
    setFromEditStatus,
    setAnnotationViewStatus,
    getAnnotationContentList,
    setValidatorViewStatus,
    quickSearchRenderData,
    getAppendixInfos,
    getPdfInfos,
  };
}
