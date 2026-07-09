import approvalDesignModal from './components/modals/approval-design-modal.vue';
import { useEdhrSummary } from './hook/useEdhrSummary';
import ProcessModal from './components/modals/process-modal.vue';
import SelectProcessModal from './components/modals/select-process-modal.vue';

export type { EdhrSummaryProps } from './hook/useEdhrSummary';

async function openDesignModal(props) {
  await gct.openUtil.fullScreen(approvalDesignModal, { ...props });
}

const { openModal: openEdhrSummaryModal } = useEdhrSummary();

async function openProcessModal(props) {
  const { title } = props;
  await gct.openUtil.drawer(
    ProcessModal,
    { ...props },
    { title: title || $t('sys.edhr.dhrSummaryApprovalProcess'), width: 800, showFooter: false },
  );
}

export interface ProcessProps {
  title?: string;
  categoryId?: '__summary_process__' | '__change_process__'; // 默认： __summary_process__ 汇总的流程
  onClosed?: Function;
}
async function openSelectProcessModal(props: ProcessProps = {}) {
  const res: any = await gct.openUtil.modal(
    SelectProcessModal,
    {
      categoryId: props?.categoryId,
    },
    {
      title: props?.title || $t('sys.edhr.SummaryProcessSelect'),
      width: 640,
    },
  );

  if (res.ok) {
    if (props?.onClosed && typeof props?.onClosed === 'function') props.onClosed(res.data);
  }
  return res;
}

export { openEdhrSummaryModal, openDesignModal, openProcessModal, openSelectProcessModal };
