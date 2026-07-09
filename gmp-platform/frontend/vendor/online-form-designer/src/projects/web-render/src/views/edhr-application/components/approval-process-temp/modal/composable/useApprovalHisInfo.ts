import { ref, reactive, onBeforeMount } from 'vue';
import { useI18n } from 'vue-i18n';
import { message as Message } from 'ant-design-vue';
import { IModal } from '@gct/runtime';
import { ModalInfo, ModalName } from '../../index';
import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import {
  postApproveProcessApprove,
  postApproveProcessReassign,
  postApproveProcessReturn,
} from '/@/apis/gct-apaas/ApproveProcessController';
import { openApprovalFlowModal } from '/@/projects/web-render/src/render/Event/utils/kitEdhr';
import { ApprovalModal } from '/@/projects/online-form/src/approval/approval-modal/index';

export interface IProps {
  modal: IModal;
  workflowId?: string;
  detailMode: boolean;
  subjectData: {
    name?: string;
    code?: string;
    description?: string;
    businessId?: string;
    extraProps?: {
      [key: string]: any;
    };
    [key: string]: any;
  };
}
export function useApprovalHisInfo(props: IProps) {
  const { t } = useI18n();

  const loadingMap = reactive({
    spinning: false,
    approve: false,
    reassign: false,
    return: false,
  });

  const processData = ref<{
    proc_inst_id_: string;
    approve_process_id_: string;
    effective_date_: string;
    status_: string;
    /**
     * 旧参数: 后端用来存储当时审核那一刻的数据快照信息
     */
    old_params_: string;
  }>();

  /**
   * 查看审核设计流程
   */
  function handleViewProcess() {
    openApprovalFlowModal(
      {
        instId: processData.value!.proc_inst_id_,
        processId: processData.value!.approve_process_id_,
      },
      true,
    );
  }

  /**
   * 回退
   */
  async function handleReturn() {
    try {
      loadingMap.return = true;
      await postApproveProcessReturn({
        businessId: props.subjectData.businessId,
        taskId: props.subjectData.taskId,
      } as any);
      Message.success('操作成功');
      props.modal.dismiss({ ok: true });
    } catch (error) {
      console.log(error);
    }
    loadingMap.return = false;
  }

  /**
   * 转办
   */
  async function handleReassign() {
    const opts = {
      showFields: ['person'],
      requiredFields: ['person'],
      signatureType: 'Account',
    };
    loadingMap.reassign = true;
    const res: any = await gct.openUtil.modal(
      ApprovalModal,
      {
        opts,
      },
      {
        title: '转办操作',
        width: 640,
        height: 'auto',
        okText: t('sys.okText'),
        showFooter: true,
      },
    );
    if (res.ok) {
      await postApproveProcessReassign({
        businessId: props.subjectData.businessId,
        taskId: props.subjectData.taskId,
        toUserId: res.data![0]!.person,
      } as any);
      Message.success('操作成功');
      props.modal.dismiss({ ok: true });
    }
    loadingMap.reassign = false;
  }

  /**
   * 审核
   */
  async function handleApprove() {
    try {
      loadingMap.approve = true;
      await postApproveProcessApprove({
        businessId: props.subjectData.businessId,
        taskId: props.subjectData.taskId,
      } as any);
      Message.success('操作成功');
      props.modal.dismiss({ ok: true });
    } catch (error) {
      console.log(error);
    }
    loadingMap.approve = false;
  }

  /**
   * 加载审核流程业务信息
   * @returns Promise<any>
   */
  async function loadApprovalProcess() {
    try {
      const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'getById',
          modelKey: 'em_edhr_summary_approve_his',
          modelCategory: 'entity',
        },
        {
          id: props.subjectData.businessId,
        },
        {
          // @ts-ignore
          id: props.subjectData.businessId,
        },
      );
      return res;
    } catch (err) {
      return { ok: false, data: {} };
    }
  }

  onBeforeMount(async () => {
    try {
      loadingMap.spinning = true;
      const { data } = (await loadApprovalProcess()) as any;
      processData.value = data;
    } catch (error) {
      console.log(error);
    }
    loadingMap.spinning = false;
  });

  return {
    loadingMap,
    processData,
    handleViewProcess,
    handleReturn,
    handleReassign,
    handleApprove,
    loadApprovalProcess,
  };
}

export async function openApprovalSubjectInfoModal(
  params: IProps['subjectData'],
  subjectType = ModalName.Routing,
  modalProps?: {
    title?: string;
    width?: number;
    height?: number;
    detailMode?: boolean;
  },
) {
  const res = await gct.openUtil.drawer(
    ModalInfo[subjectType],
    {
      workflowId: params?.routingId,
      subjectData: params,
      detailMode: (params?.detailMode || modalProps?.detailMode) ?? false,
      paramExtraProps: {
        ...(params.extraProps ?? {}),
      },
    },
    {
      title: modalProps?.title ?? $t('sys.detail'),
      width: modalProps?.width ?? 800,
      showFooter: false,
      class: 'biz-bpmn-runtime-drawer',
    },
  );
  return res;
}
