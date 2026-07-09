import BizFlowIndex from './index.vue';
import BizBpmnRuntime from '/@/components/BpmnRuntime/biz/index.vue';
import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { BizFlowModule } from '@gct/flow/src/plugins/biz-bpmn/enums';

export interface modalProps {
  id?: string;
  name?: string;
  modelKey?: string;
  modelName?: string;
  modelCategory?: string;
  type?: BizFlowModule;
  fuuid?: string;
  closed?: Function;
}

async function getTransactionInfo(id: string) {
  return await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
    {
      modelCategory: 'entity',
      modelKey: 'em_txn_definition',
      bsKey: 'biz_txn_info',
    },
    {
      id,
    },
  );
}
export async function openDesignModal(props: modalProps) {
  const { id, type, closed } = props;
  // if (type === 'edhr') {
  //   const info = await getTransactionInfo(id);
  //   props = {
  //     ...props,
  //     ...pick(info || {}, ['modelKey', 'modelName', 'name']),
  //   };
  // }
  const res: any = await gct.openUtil.fullScreen(BizFlowIndex, {
    id,
    // processInfo: { ...props },
    type,
  });
  if (res.ok) {
    if (closed && typeof closed === 'function') closed();
  }
}

export interface PathModalProps {
  txnId?: string; // 事务实例ID
  instId?: string; // 流程实例id
}
export async function openBizFlowPathModal(props: PathModalProps) {
  // const { closed } = props;
  const res: any = await gct.openUtil.drawer(
    BizBpmnRuntime,
    {
      ...props,
    },
    {
      title: $t('sys.edhr.flowPath'),
      width: 800,
      showFooter: false,
      class: 'biz-bpmn-runtime-drawer',
    },
  );
  if (res.ok) {
    // if (closed && typeof closed === 'function') closed();
  }
}
