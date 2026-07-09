import { ref, watch, computed } from 'vue';
import { isEmpty } from 'lodash-es';
import { EntityModelCategoryEnum } from '@gct/runtime';
import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { SummaryApproveHisTypeEnum, commonUtils, useNocodeEmitter } from '@gct/nocode-base';

import { EdhrInstanceResponse, OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';
import { InstanceStatusValues, useEnterFillProcess } from '../utils/instance-status';

import type { IWikiTreeData } from '@gct/nocode-base';

interface IProps {
  /** 物料编号 */
  materialNo: string;
  /** 选择的模板id */
  ofTmplId?: string;
  /** 选择的模板实例id */
  ofInstanceId?: string;
  /** 类型 */
  recordType?: string;
  /** 实例状态 */
  instanceStatus?: string;
}

interface IPayload {
  /** 页面类型 */
  pageType: string;
}

export function useEbrWikiFactory(props: IProps, payload: IPayload) {
  const { emitter, EmitterEnum } = useNocodeEmitter();
  const { canEnterChangeProcess } = useEnterFillProcess();

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

  const edhrCounter = ref(0);
  const edhrFinisher = ref(0);
  const instanceCounter = ref(0);
  const edhrIconStatusCounter = ref(0);

  async function requestInstanceByMaterialNo(id) {
    const detail: any =
      await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: 'em_product_process',
          bsKey: 'getInstanceByMaterialNo',
        },
        {},
        { materialNo: id },
        { ignoreParamsToData: true },
      );
    console.log('wiki大纲和edhr实例', detail);

    if (detail) {
      const status = canEnterChangeProcess(detail.edhrInstance.instanceStatus);

      if (!status) {
        return false;
      }
    }
    return detail;
  }

  watch(
    [() => props.materialNo, () => props.recordType, () => edhrCounter.value],
    async ([newMaterialNo, newRecordType, _]) => {
      if (isEmpty(newMaterialNo)) return;
      loading.value = true;
      clear(); // 清空之前的结果
      if (newRecordType === 'doc') {
        edhrFinisher.value++;
        loading.value = false;
        selectSelfInfo.value = { id: newMaterialNo, instanceStatus: props.instanceStatus };
        return;
      }
      try {
        const detail = await requestInstanceByMaterialNo(newMaterialNo);

        if (detail) {
          treeData.value = commonUtils.listTransformTree(detail.docOutlines);
          edhrInstance.value = detail.edhrInstance;
        }
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

  watch(
    [() => treeSelectDocData.value, () => instanceCounter.value],
    async ([newTreeSelectDocData, _]) => {
      if (newTreeSelectDocData) {
        const tid = newTreeSelectDocData.refId || newTreeSelectDocData.id;

        const res: any =
          await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
            {
              modelCategory: EntityModelCategoryEnum.ENTITY,
              modelKey: 'em_edhr_summary_form_inst',
              bsKey: 'biz_search_in_select',
            },
            {
              ofTmplId: tid, // 在线表单模板id
              edhrInstanceId: edhrInstance.value?.id!, // edhr实例id
            },
          );

        docInstanceList.value = res?.data ?? [];
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  watch(
    () => docInstanceList.value,
    (newDocInstanceList) => {
      if (newDocInstanceList && newDocInstanceList.length !== 0) {
        if (!selectSelfInfo.value) {
          selectSelfInfo.value =
            props.ofInstanceId && props.ofTmplId === treeSelectDocData.value.id
              ? (newDocInstanceList ?? []).find((item) => item.id === props.ofInstanceId)
              : newDocInstanceList?.[0];
        }
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
    if (props.recordType === 'doc') {
      return selectSelfInfo.value?.id;
    }
    return treeData.value.length !== 0;
  });

  const selectInstanceInfo = computed(() => {
    let id: string | undefined;
    let showType: 'TMPL' | 'INST' | undefined;

    // 有实例的情况下显示实例， 没有实例的情况下显示模板
    if (selectSelfInfo.value?.id) {
      id = selectSelfInfo.value?.id;
      showType = 'INST';
    } else if (treeSelectDocData.value?.id) {
      id = treeSelectDocData.value?.refId;
      showType = 'TMPL';
    }

    if (!id) return undefined;

    return { id, showType };
  });

  const usePermissionActions = computed(() => {
    /** edhr实例是否已经归档 */
    const currentInstanceStatus =
      props.recordType === 'doc'
        ? selectSelfInfo.value?.instanceStatus
        : edhrInstance.value?.instanceStatus;
    const archived2EdhrInstance = [InstanceStatusValues.ARCHIVED].includes(currentInstanceStatus);

    // Base actions
    const baseActions = {
      archived2EdhrInstance, //edhr实例是否已经归档
      EDHRRelate: false, // 关联EDHR按钮权限控制
      Annotate: false, // 变更记录按钮权限控制
      Cancel: false, // 表单作废 重新提交按钮权限控制
      Update: false, // 表单变更按钮权限控制
      _gct_summary_approve_type_: '', // 变更类型（作废按钮和变更按钮接口使用）
    };

    if (archived2EdhrInstance) {
      return baseActions;
    }

    switch (payload.pageType) {
      case 'edhr-filling':
        return {
          ...baseActions,
          EDHRRelate: false,
        };
      case 'record-change':
        return {
          ...baseActions,
          Annotate: true,
          Cancel: true,
          Update: true,
          _gct_summary_approve_type_:
            props.recordType === 'doc'
              ? SummaryApproveHisTypeEnum.FORM_CHANGE
              : SummaryApproveHisTypeEnum.DHR_CHANGE,
        };
      default:
        return baseActions;
    }
  });

  function clear() {
    treeData.value = [];
    edhrInstance.value = {};
    docInstanceList.value = [];
    treeSelectDocData.value = undefined;
    selectSelfInfo.value = undefined;
  }

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

  return {
    loading,
    hasData,
    treeData,
    edhrInstance,
    docInstanceList,
    treeSelectDocData,
    selectSelfInfo,
    selectInstanceInfo,
    usePermissionActions,
    updateEdhrCounter,
    /** 刷新实例列表信息 */
    updateInstanceCounter,
    updateEdhrIconStatusCounter,
  };
}
