import { ref, watch, computed } from 'vue';
import { isEmpty } from 'lodash-es';
import { Dayjs } from 'dayjs';
import { EntityModelCategoryEnum } from '@gct/runtime';
import { SummaryApproveHisTypeEnum } from '@gct/nocode-base';
import { useFillTimeChecker } from './useFillTimeChecker';
import {
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { getOnlineFormInstanceQuery } from '/@/apis/gct-apaas/OnlineFormInstanceController';
import { OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';

interface IProps {
  /** 记录本主键 */
  recordBookId: string;
  /** 进入时间 */
  entryTime?: Dayjs;
  /** 是否是查看页面 */
  isViewPage: boolean;
  /** 页面类型 */
  pageType?: string;
  /** 是否启用表单填报时间段限制 */
  isFillRangeOn: boolean;
  /** 是否启用填报截止时间限制 */
  isFillDeadlineOn: boolean;
  /** 填报截止时间限制提示信息 */
  fillDeadlineOnMsg: string;
}

export function useRecordBookFillFactory(props: IProps) {
  /** 页面加载状态 */
  const loading = ref(false);

  const recordBookCounter = ref(0);
  const recordBookFinisher = ref(0);
  const instanceCounter = ref(0);

  /** 记录本详情信息 */
  const recordBookDetailInfo = ref();
  /** 记录本填报配置 */
  const recordBookFillConfig = ref();
  /** 在线表单实例列表 */
  const docInstanceList = ref<Array<OnlineFormInstanceResponse>>([]);
  /** 选择的实例信息 */
  const selectSelfInfo = ref<any>();
  const searchVal = ref();

  const { check } = useFillTimeChecker({
    recordBookFillConfigRef: recordBookFillConfig,
  });

  /** 查询记录本详情信息 */
  async function requestRecordBookDetail(id: string) {
    const res: any = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_notebook',
        bsKey: 'getById',
      },
      { id },
    );

    console.log('记录本详情', res);

    return res?.data ?? {};
  }

  /** 获取记录本填报配置信息 */
  async function requestRecordBookFillConfig(data) {
    const res: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: 'em_notebook_fill_config',
        bsKey: 'getOne',
      },
      {
        query: {
          'tmpl_id_.eq': data.tmpl_id_.split(':')?.[1],
          'notebook_id_.eq': data.id_,
        },
      },
    );
    console.log('记录本填报配置', res);
    return res?.data ?? {};
  }

  // 加载实例列表
  async function loadRecordBookInstances(data, description?: string) {
    const res = await getOnlineFormInstanceQuery({
      description,
      ext8: data.id_,
      ofTmplId: data.tmpl_id_,
      ignoreAbandon: !(props.pageType === 'record-change'), // 是否忽略作废表单
      pageNo: 1,
      pageSize: 9999999,
    });
    console.log('加载实例列表', res);
    return res?.data ?? [];
  }

  watch(
    [() => props.recordBookId, () => recordBookCounter.value],
    async ([newRecordBookId, _]) => {
      if (isEmpty(newRecordBookId)) return;
      loading.value = true;
      clear(); // 清空之前的结果

      try {
        const detailRes = await requestRecordBookDetail(newRecordBookId);
        let fillConfigPromise: any = Promise.resolve(null);
        let docInstanceListPromise: any = Promise.resolve(null);

        if (detailRes) {
          fillConfigPromise = requestRecordBookFillConfig(detailRes);
          docInstanceListPromise = loadRecordBookInstances(detailRes);
        } else {
          console.warn('无法操作，缺少必要数据，请联系管理员');
        }

        const [fillConfigRes, instanceListRes] = await Promise.all([
          fillConfigPromise,
          docInstanceListPromise,
        ]);

        recordBookDetailInfo.value = detailRes;
        recordBookFillConfig.value = fillConfigRes;
        docInstanceList.value = instanceListRes;
      } catch (error) {
        console.error('请求失败:', error);
      } finally {
        loading.value = false;
        recordBookFinisher.value++;
      }
    },
    { immediate: true, deep: true },
  );

  watch(
    [() => searchVal.value, () => instanceCounter.value],
    async ([newSearchValue]) => {
      const node = recordBookDetailInfo.value;
      if (!node) return;
      docInstanceList.value = await loadRecordBookInstances(node, newSearchValue);
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
      // 检查当前选择值是否仍在有效列表中
      const currentValueValid =
        selectSelfInfo.value &&
        newDocInstanceList.some((item) => item.id === selectSelfInfo.value?.id);

      // 当选择值未设置或不在有效列表中时重新选择
      if (!selectSelfInfo.value || !currentValueValid) {
        selectSelfInfo.value = newDocInstanceList[0];
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const hasData = computed(() => {
    return recordBookDetailInfo.value?.id_;
  });

  /** 是否是查看页面 */
  const useIsViewPage = computed(() => {
    // 最晚填报时间限制
    if (props.isFillDeadlineOn) {
      return {
        isViewPage: true,
        message: props.fillDeadlineOnMsg,
        btnNotForceReadOnly: true, // 按钮不走强制只读
      };
    }

    if (props.isFillRangeOn) {
      // 判断是否在填报时间限制中
      const res = check(props.entryTime);
      if (!res.allowed) {
        return {
          isViewPage: true,
          message: res.message,
          btnNotForceReadOnly: true, // 按钮不走强制只读
        };
      }
    }

    return {
      isViewPage: props.isViewPage,
      message: '',
    };
  });

  const usePermissionActions = computed(() => {
    /** 记录本是否已经归档 */
    const archived2RecordBook = recordBookDetailInfo.value?.status_ === 'archived';

    const baseActions = {
      archived2RecordBook, // 记录本是否已经归档
      Annotate: false, // 变更记录按钮权限控制
      Cancel: false, // 表单作废 重新提交按钮权限控制
      Update: false, // 表单变更按钮权限控制
      _gct_summary_approve_type_: '', // 变更类型（作废按钮和变更按钮接口使用）
    };

    if (archived2RecordBook) {
      return baseActions;
    }

    switch (props.pageType) {
      case 'show-create-instances':
        return {
          ...baseActions,
          archived2RecordBook: false, // 通过控制记录本是否已经归档来隐藏新建实例按钮及隐藏编辑实例备注按钮
        };
      case 'hide-create-instances':
        return {
          ...baseActions,
          archived2RecordBook: true, // 通过控制记录本是否已经归档来隐藏新建实例按钮及隐藏编辑实例备注按钮
        };
      case 'record-change':
        return {
          ...baseActions,
          Annotate: true,
          Cancel: true,
          Update: true,
          _gct_summary_approve_type_: SummaryApproveHisTypeEnum.NOTEBOOK_CHANGE,
          archived2RecordBook: true,
        };
      default:
        return {
          ...baseActions,
          archived2RecordBook: useIsViewPage.value.isViewPage, // 如果是查看模式，通过控制记录本是否已经归档来隐藏新建实例按钮及隐藏编辑实例备注按钮
        };
    }
  });

  function clear() {
    searchVal.value = undefined;
    recordBookDetailInfo.value = undefined;
    recordBookFillConfig.value = undefined;
    docInstanceList.value = [];
    selectSelfInfo.value = undefined;
  }

  /** 更新记录本信息 */
  function updateRecordBookCounter() {
    recordBookCounter.value++;
  }

  /** 更新模板实例列表信息 */
  function updateInstanceCounter() {
    instanceCounter.value++;
  }

  return {
    loading,
    hasData,
    searchVal,
    recordBookDetailInfo,
    recordBookFillConfig,
    docInstanceList,
    selectSelfInfo,
    useIsViewPage,
    usePermissionActions,
    updateRecordBookCounter,
    updateInstanceCounter,
  };
}
