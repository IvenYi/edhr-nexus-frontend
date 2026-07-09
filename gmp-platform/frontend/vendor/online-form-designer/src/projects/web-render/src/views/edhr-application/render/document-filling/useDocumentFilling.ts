import { ref, reactive } from 'vue';
import CreateModal from './modals//create-modal.vue';
import ForwardModal from './modals/forward-modal.vue';
import { putOnlineFormInstanceTaskById } from '/@/apis/gct-apaas/OnlineFormInstanceController';
import { postOnlineFormInstanceTaskForm } from '/@/apis/gct-apaas/FormInstanceController';
import type {
  FormTaskGetDTO,
  OnlineFormInsTaskRequest,
  OnlineFormInstanceResponse,
} from '/@/apis/gct-apaas/model';
import { message } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';

const formState: Partial<FormTaskGetDTO> = reactive({
  title: undefined,
  tmplName: undefined,
  relatedMaterialNo: undefined,
  createUserId: undefined,
  modifyUserId: undefined,
  startTime: undefined,
  endTime: undefined,
});

const activeTabKey = ref<'1' | '2' | '3'>('1');
const { t } = useI18n();

export const columnDefinitions = [
  { title: $t('sys.edhr.serialNo'), field: 'serialNo', minWidth: 150 },
  { title: $t('sys.pageDesigner.name'), field: 'tmplName', minWidth: 300 },
  { title: $t('sys.edhr.no'), field: 'ofCode', minWidth: 250 },
  { title: $t('sys.onlineForm.remarkName'), field: 'title', minWidth: 150 },
  {
    title: $t('sys.edhr.operatingState'),
    field: 'instanceStatus',
    slots: { default: 'work_status_render' },
  },
  {
    title: $t('sys.edhr.hasRelatedMaterialNo'),
    field: 'relatedMaterialNo',
    minWidth: 116,
    slots: { default: 'is_link_lot_render' },
  },
  { title: $t('sys.creator'), field: 'createUserName' },
  { title: $t('sys.updatePerson'), field: 'modifyUserName' },
  { title: $t('sys.createTime'), field: 'createTime', minWidth: 176 },
  { title: $t('sys.edhr.complishTime'), field: 'completedTime', minWidth: 176 },
];

/**
 * 新建任务
 */
const handleCreate = async (payload?: {
  callback: Function;
  request?: Function;
  title?: string;
  form?: object;
  disabledMaterialNo?: boolean;
  disabledTmplId?: boolean;
}) => {
  const { ok, data } = await gct.openUtil.modal<{
    ok: boolean;
    data: OnlineFormInsTaskRequest;
  }>(
    CreateModal,
    {
      form: payload?.form,
      disabledMaterialNo: payload?.disabledMaterialNo,
      disabledTmplId: payload?.disabledTmplId,
    },
    {
      title: payload?.title ?? $t('sys.new'),
      width: '640px',
      okText: $t('sys.okText'),
    },
  );

  if (!ok) return;
  if (typeof payload?.request === 'function') {
    await payload.request(data);
  } else {
    // ?后续待确认: 传入module区分生产/检验/放行单
    await postOnlineFormInstanceTaskForm(data);
  }
  message.success(t('sys.doSuccess'));

  if (payload?.callback && typeof payload.callback === 'function') {
    payload.callback();
  }
};

/**
 * 转发
 * @param payload
 */
const handleForward = async (payload?: {
  data: OnlineFormInstanceResponse;
  callback: Function;
}) => {
  const { ok, data } = await gct.openUtil.modal<{
    ok: boolean;
    data: {
      operatorId: string;
      operator: string;
    };
  }>(
    ForwardModal,
    {
      task: payload?.data ?? {},
    },
    {
      title: $t('sys.edhr.reassignTask'),
      width: '640px',
      okText: $t('sys.okText'),
    },
  );

  if (!ok) return;
  await putOnlineFormInstanceTaskById({ id: payload!.data.id! }, { ...data });
  message.success(t('sys.doSuccess'));

  if (ok) {
    if (payload?.callback && typeof payload.callback === 'function') {
      payload.callback();
    }
  }
};

export function useDocumentFilling() {
  return {
    formState,
    activeTabKey,
    handleCreate,
    handleForward,
  };
}
