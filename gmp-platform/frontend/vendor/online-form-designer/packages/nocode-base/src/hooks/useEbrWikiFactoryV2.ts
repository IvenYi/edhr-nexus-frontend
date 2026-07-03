import { ref, watch, computed } from 'vue';
import { isEmpty } from 'lodash-es';
import { EntityModelCategoryEnum } from '@gct/runtime';
import {
  postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey,
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { getOnlineFormInstanceAppendixFormList } from '/@/apis/gct-apaas/OnlineFormInstanceController';
import { getProductReleaseGetProductReleaseForm } from '/@/apis/gct-apaas/ProductReleaseController';
import { EdhrInstanceResponse, OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';
import { commonUtils } from '../interface';
import { useNocodeEmitter } from './useNocodeEmitter';
import type { IWikiTreeData } from '../types';

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
}

export function useEbrWikiFactoryV2(props: IProps, payload: IPayload) {
  const { emitter, EmitterEnum } = useNocodeEmitter();

  /** 页面加载状态 */
  const loading = ref(false);
  /** wiki大纲 */
  const treeData = ref<Array<IWikiTreeData>>([]);
  /** edhr实例 */
  const edhrInstance = ref<EdhrInstanceResponse>();
  /** 在线表单实例列表 */
  const docInstanceList = ref<Array<OnlineFormInstanceResponse>>([]);

  /** 选择的表单信息 */
  const treeSelectDocData = ref<any>();
  /** 选择的实例信息 */
  const selectSelfInfo = ref<any>();

  /** 放行单列表 */
  const releaseList = ref<any>([]);
  /** 附录列表 */
  const appendixList = ref<any>([]);
  /** 事务列表 */
  const transactionList = ref<any>([]);
  /** 返工列表 */
  const reworkList = ref<any>([]);
  /** 关联列表 */
  const linkList = ref<any>([]);

  /** 选择的放行单实例信息 */
  const selectReleaseInfo = ref<any>();
  /** 选择的附录实例信息 */
  const selectAppendixInfo = ref<any>();
  /** 选择的事务实例信息 */
  const selectTransactionInfo = ref<any>();
  /** 选择的返工实例信息 */
  const selectReworkInfo = ref<any>();
  /** 选择的关联实例信息 */
  const selectLinkInfo = ref<any>();

  const searchVal = ref();
  const tabActiveKey = ref();

  const edhrCounter = ref(0);
  const edhrFinisher = ref(0);
  const instanceCounter = ref(0);
  const edhrIconStatusCounter = ref(0);
  const appendixCounter = ref(0);

  async function requestInstanceByMaterialNo(materialNo) {
    const detail: any =
      await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: 'em_product_process',
          bsKey: 'getInstanceByMaterialNo',
        },
        {},
        { materialNo, mfgOrderId: props?.paramExtraProps?._gct_nocode_mfg_order_id_ },
        { ignoreParamsToData: true },
      );
    console.log('wiki大纲和edhr实例', detail);
    return detail;
  }

  /** 查询放行单列表 */
  async function requestReleaseByMaterialNo(id) {
    const res = await getProductReleaseGetProductReleaseForm({
      edhrInstanceId: id,
    });
    console.log('查询放行单列表', res);
    if (!res) return [];

    if (res.instance) {
      return [{ ...res.instance, showType: 'INST' }];
    }

    if (res.tmpl) {
      const { baseId, id, name, formType } = res.tmpl;
      return [
        {
          id: `${baseId}:${id}`,
          tmplName: name,
          formType,
          dataStatus: null,
          instanceStatus: null,
          showType: 'TMPL',
        },
      ];
    }

    return [];
  }

  /** 查询附录列表 */
  async function requestAppendixByMaterialNo(id) {
    const list: any = await getOnlineFormInstanceAppendixFormList({
      materialNo: id,
      mfgOrderId: props?.paramExtraProps?._gct_nocode_mfg_order_id_,
    });
    console.log('查询附录列表', list);
    return (list ?? [])?.filter((item) => item.ext1 !== 'rework');
  }

  /** 查询事务、返工、关联表单列表  */
  async function requestTxn2ReworkList(instId, lotSnNo, materialStatus, mfgOrderId) {
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_edhr_summary_form_inst',
        bsKey: 'biz_search_all_form_inst',
      },
      {
        edhrInstId: instId,
        materialNo: lotSnNo,
        materialStatus: materialStatus,
        mfgOrderId: mfgOrderId,
        isAll: true,
      },
    );

    console.log('查询事务、返工、关联表单列表', res);
    return {
      reworkList: res?.reworkList || [],
      txnList: res?.txnList || [],
      relationFormList: res?.relationFormList || [],
    };
  }

  watch(
    [() => props.materialNo, () => edhrCounter.value],
    async ([newMaterialNo, _]) => {
      if (isEmpty(newMaterialNo)) return;
      loading.value = true;
      clear(); // 清空之前的结果

      try {
        const instancePromise = requestInstanceByMaterialNo(newMaterialNo);
        const appendixPromise = requestAppendixByMaterialNo(newMaterialNo);
        const edhrRes = await instancePromise;

        let releasePromise: any = Promise.resolve(null);
        let txn2ReworkPromise: any = Promise.resolve(null);

        if (edhrRes) {
          releasePromise = requestReleaseByMaterialNo(edhrRes.edhrInstance.id);
          txn2ReworkPromise = requestTxn2ReworkList(
            edhrRes.edhrInstance.id,
            edhrRes.edhrInstance.materialNo,
            edhrRes.edhrInstance.materialStatus,
            edhrRes.edhrInstance.mfgOrderId,
          );
        } else {
          console.warn('edhrRes 不存在，跳过 release 请求');
        }
        const [releaseRes, appendixRes, txn2ReworkRes] = await Promise.all([
          releasePromise,
          appendixPromise,
          txn2ReworkPromise,
        ]);

        if (edhrRes) {
          treeData.value = commonUtils.listTransformTree(edhrRes.docOutlines);
          edhrInstance.value = edhrRes.edhrInstance;
        }

        releaseList.value = releaseRes ?? [];
        appendixList.value = appendixRes ?? [];
        transactionList.value = txn2ReworkRes.txnList ?? [];
        reworkList.value = txn2ReworkRes.reworkList ?? [];
        linkList.value = txn2ReworkRes.relationFormList ?? [];

        if (!selectReleaseInfo.value) {
          selectReleaseInfo.value = releaseRes?.[0];
        }

        if (!selectAppendixInfo.value) {
          selectAppendixInfo.value = appendixRes?.[0];
        }

        if (!selectTransactionInfo.value) {
          selectTransactionInfo.value = txn2ReworkRes.txnList?.[0];
        }

        if (!selectReworkInfo.value) {
          selectReworkInfo.value = txn2ReworkRes.reworkList?.[0];
        }

        if (!selectLinkInfo.value) {
          selectLinkInfo.value = txn2ReworkRes.relationFormList?.[0];
        }

        tabActiveKey.value = '2'; // 初始设置成eDHR目录tab上
      } catch (error) {
        console.error('请求失败:', error);
      } finally {
        loading.value = false;
        edhrFinisher.value++;
      }
    },
    { immediate: true, deep: true },
  );

  watch(
    () => edhrIconStatusCounter.value,
    async (newEdhrIconStatusCounter) => {
      if (newEdhrIconStatusCounter) {
        const detail = await requestInstanceByMaterialNo(props.materialNo);
        if (detail) {
          treeData.value = commonUtils.listTransformTree(detail.docOutlines);
        }
      }
    },
  );

  watch(
    () => appendixCounter.value,
    async (newAppendixCounter) => {
      if (newAppendixCounter) {
        const detail = await requestAppendixByMaterialNo(props.materialNo);
        if (detail) {
          appendixList.value = detail ?? [];
        }
      }
    },
  );

  watch(
    [() => treeData.value, () => props.ofTmplId],
    ([newTreeData, newOfTmplId]) => {
      if (newTreeData && newTreeData.length !== 0) {
        if (!treeSelectDocData.value) {
          treeSelectDocData.value = commonUtils.findFirstDoc(newTreeData, newOfTmplId);
        }
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  // 加载实例列表
  async function loadInstances(tid: string, description?: string) {
    // DHR 实例本身已经是 作废 或者是记录变更页面 不需要忽略作废的表单
    const isAbandon = edhrInstance.value?.instanceStatus === 'ABANDON';
    const isRecordChangePage = payload.pageType === 'record-change';

    const res: any = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_edhr_summary_form_inst',
        bsKey: 'biz_search_in_select',
      },
      {
        docOutlineId: treeSelectDocData.value?.id,
        ofTmplId: tid, // 在线表单模板id
        edhrInstanceId: edhrInstance.value!.id!, // edhr实例id
        ignoreAbandon: !(isAbandon || isRecordChangePage), // 是否忽略作废表单
        pageNo: 1,
        pageSize: 9999999,
        description,
      },
    );

    if (res?.data) {
      docInstanceList.value = res.data ?? [];
    }
  }

  watch(
    () => treeSelectDocData.value,
    async (newNode) => {
      if (!newNode) return;

      // 获取模板唯一标识
      const tid = newNode.refId || newNode.id;

      // 查询是否已有实例
      const res: any = await payload.needCreateNewInstance?.({
        ofTmplId: tid,
        edhrInstanceId: edhrInstance.value!.id!,
        ignoreAbandon: true,
        pageNo: 1,
        pageSize: 20,
      });

      if (res) {
        // 无实例，初始化一个
        await payload.createOnlineFormInstance?.({
          docOutlineId: newNode.id!,
          edhrInstanceId: edhrInstance.value!.id!,
          tmplId: tid,
          description: $t('sys.onlineForm.initializeInstance'),
        });
      }

      // 初始化完毕后，加载完整列表
      await loadInstances(tid, searchVal.value);
    },
    { immediate: true },
  );

  watch(
    [() => searchVal.value, () => instanceCounter.value],
    async ([newSearchValue]) => {
      const node = treeSelectDocData.value;
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
        if (selectSelfInfo.value) {
          selectSelfInfo.value = null;
        }
        return;
      }

      // 存在特定实例ID且模板匹配的情况
      const hasSpecialInstance =
        props.ofInstanceId && props.ofTmplId === treeSelectDocData.value.id;
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
    return treeData.value.length !== 0;
  });

  const selectInstanceInfo = computed(() => {
    const key = tabActiveKey.value;
    let id: string | undefined;
    let showType: 'TMPL' | 'INST' | undefined;

    switch (key) {
      case '1':
        id = selectReleaseInfo.value?.id;
        showType = selectReleaseInfo.value?.showType;
        break;
      case '2':
      case '7':
        // 等待实例列表加载完成再做判断
        // 有实例的情况下显示实例， 没有实例的情况下显示模板
        if (docInstanceList.value.length) {
          if (selectSelfInfo.value?.id) {
            id = selectSelfInfo.value?.id;
            showType = 'INST';
          }
        } else if (treeSelectDocData.value?.id) {
          if (!searchVal.value) {
            id = treeSelectDocData.value?.refId;
            showType = 'TMPL';
          }
        }
        break;
      case '3':
        id = selectAppendixInfo.value?.id;
        showType = 'INST';
        break;
      case '4':
        id = selectTransactionInfo.value?.id;
        showType = 'INST';
        break;
      case '5':
        id = selectReworkInfo.value?.id;
        showType = 'INST';
        break;
      case '6':
        id = selectLinkInfo.value?.id;
        showType = 'INST';
        break;
      default:
        return undefined;
    }

    if (!id) return undefined;

    return { id, showType };
  });

  /** 已汇总、审核中、 已放行的状态下DHR就是预览状态 InstanceStatusValues */
  const isPreviewType = computed(() => {
    return ['SUMMARIZED', 'IN_AUDIT', 'ARCHIVED'].includes(
      edhrInstance.value?.instanceStatus as string,
    );
  });

  /** 汇总审核中 */
  const isInAudit = computed(() => 'IN_AUDIT' === edhrInstance.value?.instanceStatus);

  /** 是否是查看页面 */
  const useIsViewPage = computed(() => {
    // 放行单、事务、返工只能是只读
    if (
      tabActiveKey.value === '1' ||
      tabActiveKey.value === '4' ||
      tabActiveKey.value === '5' ||
      tabActiveKey.value === '6'
    ) {
      return true;
    }

    if (tabActiveKey.value === '3') {
      return payload.isViewPage;
    }

    // 如果DHR 处于汇总状态，那么都是查看模式 InstanceStatusValues
    if (isPreviewType.value) {
      return true;
    }

    // 如果开启了限制
    if (payload.viewPageLimit) {
      // 只有选择的表单才能进行操作，其他都是查看模式
      return treeSelectDocData.value.id !== props.ofTmplId;
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
      defaultShowCatalogue: payload.pageType !== 'production-execution', // 生产执行模式（待填报的表单）需要默认隐藏目录， 其他场景需要默认显示
      showOtherMenu: !isInAudit.value, // DHR 是审核中的状态，那么只需要目录和放行单 其他情况需要展示 目录、放行单、附录、事务、返工
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

  function clear() {
    searchVal.value = undefined;
    treeData.value = [];
    edhrInstance.value = {};
    docInstanceList.value = [];
    treeSelectDocData.value = undefined;
    selectSelfInfo.value = undefined;

    releaseList.value = [];
    appendixList.value = [];
    transactionList.value = [];
    reworkList.value = [];
    linkList.value = [];

    selectReleaseInfo.value = undefined;
    selectAppendixInfo.value = undefined;
    selectTransactionInfo.value = undefined;
    selectReworkInfo.value = undefined;
    selectLinkInfo.value = undefined;
    tabActiveKey.value = undefined;
  }

  /** 更新wiki信息 */
  function updateEdhrCounter() {
    edhrCounter.value++;
  }

  /** 更新模板实例列表信息 */
  function updateInstanceCounter() {
    instanceCounter.value++;
  }

  /** 更新edhr icon信息 */
  function updateEdhrIconStatusCounter() {
    edhrIconStatusCounter.value++;
  }

  /** 更新附录列表信息 */
  function updateAppendixCounter() {
    appendixCounter.value++;
  }

  return {
    loading,
    hasData,
    treeData,
    edhrInstance,
    docInstanceList,
    treeSelectDocData,
    selectSelfInfo,
    searchVal,
    releaseList,
    appendixList,
    transactionList,
    reworkList,
    linkList,
    selectReleaseInfo,
    selectAppendixInfo,
    selectTransactionInfo,
    selectReworkInfo,
    selectLinkInfo,
    tabActiveKey,
    selectInstanceInfo,
    useIsViewPage,
    usePermissionActions,
    updateEdhrCounter,
    /** 刷新实例列表信息 */
    updateInstanceCounter,
    updateEdhrIconStatusCounter,
    updateAppendixCounter,
  };
}
