import { message } from 'ant-design-vue';
import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import CreateEdhrInstance from '../modal/create-edhr-instance.vue';
import { useEnterFillProcess } from '../utils/instance-status';

export function useEdhrFill(props, emit) {
  const { canEnterFillProcess } = useEnterFillProcess();

  /** 根据记录编号是否存在eDHR实例id */
  async function queryMaterialNo2EdhrInstance(
    params,
  ): Promise<
    { action: 'create' | 'detail' | 'no-fill'; data?: any; materialNo?: string } | undefined
  > {
    setLoading(true);
    const res: any = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'getInstanceByMaterialNo',
        modelCategory: 'entity',
        modelKey: 'em_product_process',
      },
      {},
      {
        materialNo: params.materialNo,
        type: params.type,
      },
      {
        ignoreParamsToData: true,
      },
    );

    setLoading(false);

    if (res) {
      const status = await canEnterFillProcess(res.edhrInstance);

      if (!status) {
        return {
          action: 'no-fill',
        };
      }

      return {
        action: 'detail',
        materialNo: params.materialNo,
      };
    }

    const result = await gct.openUtil.modal(
      CreateEdhrInstance,
      { context: { materialNo: params.materialNo }, params: {} },
      {
        title: $t('sys.webRender.edhrApplication.sureToCreateMaterialNoWithName', {
          name: `【${params.materialNo}】`,
        }),
        width: 640,
        showFooter: true,
        okText: $t('sys.okText'),
      },
    );

    if (result.ok) {
      return {
        action: 'create',
        data: result.data,
      };
    }
  }

  async function setLoading(loading: boolean) {
    emit('update:loading', loading);
  }

  async function edhrFill(formState) {
    if (!formState.materialNo) {
      message.warn($t('sys.webRender.edhrApplication.materialNoEmpty'));
      return;
    }

    const res = await queryMaterialNo2EdhrInstance(formState);
    if (!res) return;

    if (res && res.action === 'no-fill') return;

    // 创建eDHR实例
    if (res && res.action === 'create') {
      setLoading(true);
      await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'insertEdhrInstanceAndOfInstance',
          modelCategory: 'entity',
          modelKey: 'em_product_process',
        },
        {
          materialNo: res.data.materialNo,
          materialStatus: res.data.materialStatus,
          productId: res.data.productId,
          tmplId: res.data.tmplId,
        },
      );

      setLoading(false);
      return res.data.materialNo;
    }
    return res.materialNo;
  }

  return {
    edhrFill,
  };
}
