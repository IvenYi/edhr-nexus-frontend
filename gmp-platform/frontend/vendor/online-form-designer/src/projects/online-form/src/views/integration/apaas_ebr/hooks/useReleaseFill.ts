import { message } from 'ant-design-vue';
import { useEnterFillProcess } from '../utils/instance-status';
import CreateReleaseInstance from '../modal/create-release-instance.vue';
import {
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey,
} from '/@/apis/gct-apaas/ModelComprehensiveController';

export function useReleaseFill(props, emit) {
  const { canEnterReleaseFillProcess } = useEnterFillProcess();

  /** 根据记录编号是否存在放行单实例id */
  async function queryMaterialNo2ReleaseInstance(params): Promise<
    | {
        action: 'create' | 'detail' | 'no-fill';
        materialNo?: string;
        tmplId?: string;
        mfgOrderId?: string;
      }
    | undefined
  > {
    setLoading(true);

    const res: any = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'getProductReleaseByMaterialNo',
        modelKey: 'em_product',
        modelCategory: 'entity',
      },
      {},
      { materialNo: params.materialNo, type: 'excute' },
      { ignoreParamsToData: true },
    );

    console.log('res', res);
    setLoading(false);

    // 放行单已经存在，直接展示
    if (res && res.releaseFormInstanceId) {
      return {
        action: 'detail',
        materialNo: res?.materialNo || params?.materialNo,
      };
    }

    return {
      action: 'create',
      materialNo: res?.materialNo || params?.materialNo,
      tmplId: res ? `${res.baseId}:${res.id}` : undefined,
      mfgOrderId: res ? res.mfgOrderId : undefined,
    };
  }

  async function setLoading(loading: boolean) {
    emit('update:loading', loading);
  }

  async function releaseFill(formState: { materialNo?: string }): Promise<string | undefined> {
    if (!formState.materialNo) {
      message.warn($t('sys.webRender.edhrApplication.materialNoEmpty'));
      return;
    }

    const res = await queryMaterialNo2ReleaseInstance(formState);
    if (!res) return;

    if (res.action === 'no-fill') return;

    if (res.action !== 'create') return res.materialNo;

    setLoading(true);
    try {
      const result: any = await gct.openUtil.modal(
        CreateReleaseInstance,
        {
          context: { materialNo: res.materialNo, tmplId: res.tmplId, mfgOrderId: res.mfgOrderId },
          params: {},
        },
        {
          title: $t('sys.edhr.field.createReleaseTmpl'),
          width: 640,
          showFooter: true,
        },
      );

      if (!result?.ok) return;

      try {
        await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
          {
            bsKey: 'createCustomProductRelease',
            modelKey: 'em_product',
            modelCategory: 'entity',
          },
          { ...result.params },
          {},
          { ignoreParamsToData: true },
        );
        return res.materialNo;
      } catch (postErr) {
        // message.error('创建放行单失败');
        return;
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    releaseFill,
  };
}
