import { IModalOptions } from '@gct/runtime';
import LaunchApprovalProcess from './index.vue';

interface IProps {
  modalProps?: IModalOptions;
  params?: IParams;
  callback?: Function;
}

export enum ProcessType {
  ROUTING = 'ROUTING', // 工艺
  PRODUCT_PROCESS = 'PRODUCT_PROCESS', // 产品制程
  ONLINE_FORM_TEMP = 'ONLINE_FORM_TEMP', // 表单模板
  DHR_TEMP = 'DHR_TEMP', // DHR模板
}

export const modelKeyMap = {
  [ProcessType.ROUTING]: 'em_routing',
  [ProcessType.PRODUCT_PROCESS]: 'em_product_process',
  [ProcessType.ONLINE_FORM_TEMP]: 'em_form_category',
  [ProcessType.DHR_TEMP]: 'em_edhr_category',
};

export async function onOpenLaunchApprovalModal({
  modalProps = {},
  params = {
    processType: ProcessType.ROUTING,
    processId: undefined,
    onlyEffect: false,
    subjectData: {},
  },
  callback,
}: IProps) {
  const { processType } = params ?? {};
  const res: any = await gct.openUtil.modal(
    LaunchApprovalProcess,
    {
      ...params,
    },
    {
      ...modalProps,
      width: modalProps?.width ?? 640,
      height: modalProps?.height ?? 400,
      title: modalProps?.title ?? $t('sys.edhr.processChoice.modalTitle'),
      loading: true,
      okText:
        modalProps?.okText ||
        ([ProcessType.ROUTING, ProcessType.PRODUCT_PROCESS].includes(processType)
          ? $t('sys.edhr.processChoice.choseBtnText')
          : $t('sys.okText')),
    },
  );
  if (res.ok) {
    if (callback && typeof callback === 'function') callback();
  }
}

export default {
  onOpenLaunchApprovalModal,
};
