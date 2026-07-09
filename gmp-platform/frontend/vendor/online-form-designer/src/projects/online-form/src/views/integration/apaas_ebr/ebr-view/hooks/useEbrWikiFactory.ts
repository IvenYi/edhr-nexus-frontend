import { ref, watch, computed, toRaw } from 'vue';
import { isEmpty } from 'lodash-es';
import { EdhrInstanceResponse, OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';
import { useNocodeEmitter, IWikiTreeData } from '@gct/nocode-base';
import {
  EModuleEnum,
  ESubCategoryEnum,
} from '/@/projects/online-form/src/views/integration/apaas_ebr/ebr-view/enums';
import { CategoryModuleController } from '/@/projects/online-form/src/views/integration/apaas_ebr/ebr-view/logic/categoryMouduleController';

interface IProps {
  /** 物料编号 */
  materialNo: string;
  /** 选择的模板id */
  ofTmplId?: string;
  /** 选择的模板实例id */
  ofInstanceId?: string;
  /** 类型 */
  recordType?: string;
  /** 组件传进来的参数 */
  paramExtraProps?: any;
}

interface IPayload {
  /** 页面类型 */
  pageType: string;
  /** 查看页面限制，只能操作固定表单 */
  viewPageLimit: boolean;
  /** 是否是查看页面 */
  isViewPage: boolean;
  /** 获取页面按钮权限回调 */
  getPermStatusCallback?: Function;
  /** 是否需要新建实例 */
  needCreateNewInstance?: Function;
  /** 新建一条实例回调 */
  createOnlineFormInstance?: Function;
  /** 加载回调 */
  requestFn?: {
    /** 加载实例列表 */
    loadInstanceList: (subCategory: ESubCategoryEnum, payload: any) => Promise<any[]>;
  };
}

export function useEbrWikiFactory(props: IProps, payload: IPayload) {
  const { emitter, EmitterEnum } = useNocodeEmitter();

  /** 页面加载状态 */
  const categoryLoading = ref(false);
  const instanceLoading = ref(false);
  const loading = computed(() => categoryLoading.value || instanceLoading.value);
  const categoryMenus = ref<Array<EModuleEnum>>([]);
  /** edhr实例 */
  const edhrInstance = ref<EdhrInstanceResponse>();
  /** wiki大纲（目录） */
  const catalogTreeData = ref<Array<IWikiTreeData>>([]);
  /** 不同业务模块下的数据 */
  const productionData = ref<any>({});
  const inspectionData = ref<any[]>([]);
  const releaseData = ref<any[]>([]);
  const linkData = ref<any[]>([]);
  /** 在线表单实例列表（表单实例记录列表） */
  const docInstanceList = ref<Array<OnlineFormInstanceResponse>>([]);
  /** 目录树下选择的表单信息 */
  const treeSelectDocData = ref<any>();
  /** 选择的表单实例信息 */
  const selectSelfInfo = ref<any>();
  /** 关联子分类下（检验表单）选择的表单信息 */
  const subSelectDocData = ref<any>();

  const searchVal = ref();
  const tabActiveKey = ref<EModuleEnum>();
  const subCategory = ref<ESubCategoryEnum>();

  const edhrCounter = ref(0);
  const edhrFinisher = ref(0);
  const instanceCounter = ref(0);
  const edhrIconStatusCounter = ref(0);
  const appendixCounter = ref(0);
  const releaseCounter = ref(0);

  const selectDocData = computed({
    get() {
      if (tabActiveKey.value === EModuleEnum.INSPECTION) {
        return subSelectDocData.value;
      }
      return treeSelectDocData.value;
    },

    set(newVal) {
      const newValue = newVal
        ? {
            ...newVal,
            refId: newVal?.refId || newVal?.tmplId || newVal?.formTmplId,
          }
        : undefined;
      subSelectDocData.value = newValue;
      treeSelectDocData.value = newValue;
    },
  });

  const categoryModuleController = new CategoryModuleController({
    categoryModule: tabActiveKey.value!,
    props,
    payload,
  });

  /**
   * 获取wiki目录数据和edhr实例数据
   */
  watch(
    [() => props.materialNo, () => edhrCounter.value],
    async ([newMaterialNo, _]) => {
      if (isEmpty(newMaterialNo)) return;

      instanceLoading.value = true;
      clear(true);

      try {
        const edhrRes = await categoryModuleController.requestInstanceByMaterialNo(newMaterialNo);
        if (edhrRes) {
          edhrInstance.value = edhrRes.edhrInstance;
        }
      } finally {
        const { menus, currentMenu } = categoryModuleController.calcCategoryMenuData(
          {
            pageType: payload.pageType,
            dhrInstance: toRaw(edhrInstance.value),
          },
          props,
        );
        tabActiveKey.value = currentMenu;
        categoryMenus.value = menus;

        instanceLoading.value = false;
        edhrFinisher.value++;
      }
    },
    { immediate: true, deep: true },
  );

  async function loadCategoryModuleData(forceRefresh = false) {
    // 加载对应模块的数据
    const result = await categoryModuleController.loadDataByCategory(
      {
        // 检验 参数
        txnNodeStatusId: props?.paramExtraProps?._gct_nocode_inst_query_params_?.txnNodeStatusId,
        // others
        materialNo: props?.materialNo,
        edhrInstId: edhrInstance.value?.id,
        materialStatus: edhrInstance.value?.materialStatus,
        mfgOrderId: props?.paramExtraProps?._gct_nocode_mfg_order_id_,
      },
      forceRefresh,
    );

    switch (tabActiveKey.value) {
      case EModuleEnum.CATALOG:
        catalogTreeData.value = result || [];
        break;
      case EModuleEnum.PRODUCTION:
        productionData.value = result || {};
        break;
      case EModuleEnum.INSPECTION:
        inspectionData.value = result || [];
        break;
      case EModuleEnum.RELEASE:
        releaseData.value = result || [];
        break;
      case EModuleEnum.LINK:
        linkData.value = result || [];
        break;
      default:
        break;
    }

    return result;
  }

  watch(
    [() => tabActiveKey.value, () => props.ofTmplId],
    async ([newValue, newOfTmplId]) => {
      if (isEmpty(newValue) || newValue === EModuleEnum.ESOP) return;

      try {
        categoryLoading.value = true;
        selectSelfInfo.value = undefined;
        selectDocData.value = undefined;
        categoryModuleController.updateCategoryModule(newValue);

        const result = await loadCategoryModuleData();
        const { docData, selfInfo, category } = categoryModuleController.getDefaultSelectedData(
          result,
          newOfTmplId,
        );
        selectDocData.value = docData;
        selectSelfInfo.value = selfInfo;
        subCategory.value = category;
      } finally {
        categoryLoading.value = false;
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  /**
   * 表单更新（实例更行、自动保存）需要更新数据
   */
  watch(
    [() => edhrIconStatusCounter.value, () => appendixCounter.value, () => releaseCounter.value],
    async ([newEdhrIconStatusCounter, newAppendixCounter, newReleaseCounter]) => {
      if (newEdhrIconStatusCounter || newAppendixCounter || newReleaseCounter) {
        await loadCategoryModuleData(true);
      }
    },
  );

  /**
   *加载实例列表
   * @param tid
   * @param description
   */
  async function loadInstances(tid: string, description?: string) {
    // DHR 实例本身已经是 作废 或者是记录变更页面 不需要忽略作废的表单
    const isAbandon = edhrInstance.value?.instanceStatus === 'ABANDON';
    const isRecordChangePage = payload.pageType === 'record-change';

    docInstanceList.value = [];
    const list = await payload.requestFn?.loadInstanceList(subCategory.value!, {
      // 检验表单
      selectDocId: selectDocData.value?.id,
      // 目录树
      tid: tid,
      description,
      docOutlineId: selectDocData.value?.id, // 目录树选择的节点id、检验表单选择节点
      edhrInstanceId: edhrInstance.value?.id,
      ignoreAbandon: !(isAbandon || isRecordChangePage),
    });

    docInstanceList.value = list ?? [];
  }

  watch(
    () => selectDocData.value,
    async (newNode) => {
      if (!newNode) return;

      // 获取模板唯一标识
      const tid = newNode.refId || newNode.tmplId || newNode.id;
      // 查询是否已有实例
      const res: any = await payload.needCreateNewInstance?.(
        subCategory.value!,
        {
          // 检验
          selectDocId: newNode.id!,
          // Other
          ofTmplId: tid,
          edhrInstanceId: edhrInstance.value?.id,
          ignoreAbandon: true,
          pageNo: 1,
          pageSize: 20,
        },
        {
          ...props,
          useIsViewPage: useIsViewPage.value,
        },
      );

      if (res) {
        // 无实例，初始化一个
        await payload.createOnlineFormInstance?.(
          subCategory.value!,
          {
            description: $t('sys.onlineForm.initializeInstance'),
            // 检验表单
            businessId: newNode.id!,
            // 目录树
            docOutlineId: newNode.id!,
            edhrInstanceId: edhrInstance.value?.id,
            tmplId: tid,
          },
          props,
        );
      }
      // 初始化完毕后，加载完整列表
      await loadInstances(tid, searchVal.value);
      updateEdhrIconStatusCounter();
    },
    { immediate: true },
  );

  watch(
    [() => searchVal.value, () => instanceCounter.value],
    async ([newSearchValue]) => {
      const node = selectDocData.value;
      if (!node) return;
      const tid = node.refId || node.id;
      // 仅对已初始化过的模板执行刷新
      await loadInstances(tid, newSearchValue);
    },
    { immediate: false },
  );

  watch(
    () => docInstanceList.value,
    (newDocInstanceList) => {
      // 当列表为空数组且当前选择值存在时，清空选择
      if (!newDocInstanceList?.length) {
        selectSelfInfo.value = null;
        return;
      }

      // 存在特定实例ID且模板匹配的情况
      const hasSpecialInstance = props.ofInstanceId && props.ofTmplId === selectDocData.value.id;
      // 检查当前选择值是否仍在有效列表中
      const currentValueValid =
        selectSelfInfo.value &&
        newDocInstanceList.some((item) => item.id === selectSelfInfo.value?.id);

      // 当选择值未设置或不在有效列表中时重新选择
      if (!selectSelfInfo.value || !currentValueValid) {
        selectSelfInfo.value = hasSpecialInstance
          ? newDocInstanceList.find((item) => item.id === props.ofInstanceId) ||
            newDocInstanceList[0]
          : newDocInstanceList[0];
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  watch(
    [() => selectSelfInfo.value, () => instanceCounter.value],
    ([newSelectSelfInfo, _]) => {
      if (newSelectSelfInfo && payload.pageType === 'record-change') {
        emitter.emit(EmitterEnum.__on_select_ebr_doc_instance_id, {
          instanceId: newSelectSelfInfo.id,
        });
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const hasData = computed(() => {
    return (
      !isEmpty(catalogTreeData.value) ||
      !isEmpty(productionData.value) ||
      !isEmpty(inspectionData.value) ||
      !isEmpty(releaseData.value) ||
      !isEmpty(linkData.value)
    );
  });

  const selectInstanceInfo = computed(() => {
    let id: string | undefined; // 实例ID OR 模板ID
    let showType: 'TMPL' | 'INST' | undefined; // INST：实例， TMPL：模板

    if (
      tabActiveKey.value === EModuleEnum.CATALOG ||
      tabActiveKey.value === EModuleEnum.ESOP ||
      (tabActiveKey.value === EModuleEnum.INSPECTION &&
        subCategory.value === ESubCategoryEnum.INSPECTION_FORM)
    ) {
      // 等待实例列表加载完成再做判断
      // 有实例的情况下显示实例， 没有实例的情况下显示模板
      if (docInstanceList.value.length) {
        if (selectSelfInfo.value?.id) {
          id = selectSelfInfo.value?.id;
          showType = 'INST';
        }
      } else if (selectDocData.value?.id) {
        if (!searchVal.value) {
          id = selectDocData.value?.refId;
          showType = 'TMPL';
        }
      }
    } else {
      // 其余模块直接显示实例
      id = selectSelfInfo.value?.id || undefined;
      showType = 'INST';
    }
    return {
      id,
      showType,
    };
  });

  /** 已汇总、审核中、 已放行的状态下DHR就是预览状态 InstanceStatusValues */
  const isPreviewType = computed(() => {
    return ['SUMMARIZED', 'IN_AUDIT', 'ARCHIVED'].includes(
      edhrInstance.value?.instanceStatus as string,
    );
  });

  /** 汇总审核中 */
  const isInAudit = computed(() => 'IN_AUDIT' === edhrInstance.value?.instanceStatus);

  /**
   * @description 是否是查看页面
   * 1. Common：事务、返工、关联表单只能只读
   * 2. 生产：【可填报】待填报表单、附录
   * 3. 检验：【可填报】待填报表单、附录
   * 4. 放行：只能填报当前的放行单
   */
  const useIsViewPage = computed(() => {
    // 事务、返工、关联表单只能是只读
    if (
      subCategory.value === ESubCategoryEnum.TXN_FORM ||
      subCategory.value === ESubCategoryEnum.REWORK_FORM ||
      subCategory.value === ESubCategoryEnum.LINK_FORM
    ) {
      return true;
    }

    if (subCategory.value === ESubCategoryEnum.APPENDIX_FORM) {
      return payload.isViewPage;
    }

    // 如果DHR 处于汇总状态且不来源于检验和放行，那么都是查看模式 InstanceStatusValues
    if (
      isPreviewType.value &&
      tabActiveKey.value !== EModuleEnum.INSPECTION &&
      tabActiveKey.value !== EModuleEnum.RELEASE
    ) {
      return true;
    }

    // 如果开启了限制
    if (payload.viewPageLimit) {
      // 只有选择的表单才能进行操作，其他都是查看模式
      return !(
        selectDocData.value?.id === props.ofTmplId || selectDocData.value?.refId === props.ofTmplId
      );
    }

    return payload.isViewPage;
  });

  const usePermissionActions = computed(() => {
    /** edhr实例是否已经归档 InstanceStatusValues */
    const archived2EdhrInstance = isPreviewType.value;

    // Base actions
    const baseActions = {
      archived2EdhrInstance, //edhr实例是否已经归档
      EDHRRelate: false, // 关联EDHR按钮权限控制
      DocumentRelate: false, // 关联表单按钮权限控制
      Annotate: false, // 变更记录按钮权限控制
      Cancel: false, // 表单作废 重新提交按钮权限控制
      Update: false, // 表单变更按钮权限控制
      // @deprecated ⬇️DHR 是审核中的状态，那么只需要目录和放行单 其他情况需要展示 目录、放行单、附录、事务、返工
      showOtherMenu: !isInAudit.value,
    };

    if (archived2EdhrInstance) {
      return baseActions;
    }

    switch (payload.pageType) {
      case 'edhr-filling':
        return {
          ...baseActions,
          EDHRRelate: false,
          DocumentRelate: false,
        };
      case 'record-change':
        return {
          ...baseActions,
          Annotate: true,
          Cancel: true,
          Update: true,
        };
      case 'hide-create-instances':
        return {
          ...baseActions,
          archived2EdhrInstance: true, // 通过控制edhr实例归档来隐藏新建实例按钮及隐藏编辑实例备注按钮
        };
      default:
        return {
          ...baseActions,
          archived2EdhrInstance: useIsViewPage.value, // 如果是查看模式，通过控制edhr实例归档来隐藏新建实例按钮及隐藏编辑实例备注按钮
        };
    }
  });

  function clear(all = true) {
    searchVal.value = undefined;
    catalogTreeData.value = [];
    docInstanceList.value = [];
    selectSelfInfo.value = undefined;
    selectDocData.value = undefined;
    inspectionData.value = [];
    productionData.value = {};
    releaseData.value = [];
    linkData.value = [];

    if (!all) return;

    tabActiveKey.value = undefined;
    edhrInstance.value = undefined;
  }

  /** 更新wiki信息 */
  function updateEdhrCounter() {
    edhrCounter.value++;
  }

  /** 更新模板实例列表信息 */
  function updateInstanceCounter() {
    instanceCounter.value++;
  }

  /** 更新edhr/表单模板 icon信息 */
  function updateEdhrIconStatusCounter() {
    edhrIconStatusCounter.value++;
  }

  /** 更新附录列表信息 */
  function updateAppendixCounter() {
    appendixCounter.value++;
  }

  /** 更新放行单信息 */
  function updateReleaseCounter() {
    releaseCounter.value++;
  }

  return {
    loading,
    categoryMenus,
    hasData,
    catalogTreeData,
    edhrInstance,
    docInstanceList,
    selectSelfInfo,
    selectDocData,
    searchVal,
    subCategory,
    tabActiveKey,
    selectInstanceInfo,
    inspectionData,
    productionData,
    releaseData,
    linkData,
    useIsViewPage,
    usePermissionActions,
    updateEdhrCounter,
    /** 刷新实例列表信息 */
    updateInstanceCounter,
    updateEdhrIconStatusCounter,
    updateAppendixCounter,
    updateReleaseCounter,
  };
}
