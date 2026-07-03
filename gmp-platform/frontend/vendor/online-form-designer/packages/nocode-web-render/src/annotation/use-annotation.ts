import {
  IFormAnnotationControllerConstructParams,
  FormAnnotationController,
} from '@gct/nocode-base';
import { useUserStore } from '/@/store/modules/user';
import { message, Modal } from 'ant-design-vue';
import { GctDialog } from '/@/utils/Dialog';
import FormAbandonV2Modal from './form-abandon-v2-modal.vue';
import FormAbandonModal from './form-abandon-modal.vue';
import FormAbandonMedProModal from './form-abandon-medpro-modal.vue';

export class WebFormAnnotationController extends FormAnnotationController {
  override confirm(opts: { title: any; onOk: any; onCancel: any }) {
    Modal.confirm({
      title: opts.title,
      okText: $t('sys.okText'),
      cancelText: $t('sys.cancelText'),
      onOk: opts.onOk,
      onCancel: opts.onCancel,
    });
  }
  override warn(str: string): void {
    message.warn(str);
  }

  override info(str: string): void {
    message.info(str);
  }

  override openFormAbandonV2Modal(
    opts = {
      isFormChange: false,
    },
  ): Promise<{
    reason: any;
    applicant: any;
    reviewer: any;
    approveTmplId: any;
  } | void> {
    return new Promise((resolve, reject) => {
      GctDialog.open(FormAbandonV2Modal, {
        docName: this.docName.value,
        isFormChange: opts.isFormChange,
        okCallback: async ({ reason, applicant, reviewer, approveTmplId }) => {
          resolve({ reason, applicant, reviewer, approveTmplId });
        },
        cancelCallback: () => {
          resolve();
        },
      });
    });
  }

  override openFormAbandonModal(): Promise<{
    reason: any;
    applicant: any;
    reviewer: any;
  } | void> {
    const docName = `【${this.formIns.value?.ext2 ?? this.formIns.value.tmplName}】`;
    return new Promise((resolve, reject) => {
      GctDialog.open(FormAbandonModal, {
        docName: docName,
        userName: this.userName,
        isShowTip: this.roleBuiltinBtnPermission.value.Cancel,
        okCallback: async ({ reason, applicant, reviewer }) => {
          resolve({ reason, applicant, reviewer });
        },
        cancelCallback: () => {
          resolve();
        },
      });
    });
  }

  /**medPro 专门变更 */
  override openFormAbandonMedProModal(): Promise<{
    reason: any;
    applicant: any;
    reviewer: any;
  } | void> {
    const docName = `【${this.formIns.value?.ext2 ?? this.formIns.value.tmplName}】`;
    return new Promise((resolve, reject) => {
      GctDialog.open(FormAbandonMedProModal, {
        docName: docName,
        userName: this.userName,
        isShowTip: false,
        okCallback: async ({ reason, applicant, reviewer }) => {
          resolve({ reason, applicant, reviewer });
        },
        cancelCallback: () => {
          resolve();
        },
        options: {
          title: $t('sys.onlineForm.submitChange'),
        },
      });
    });
  }
}

/**
 * web端的表单变更，批注逻辑
 * @export
 * @param opts
 * @return {*}
 */
export function useWebAnnotation(opts: IFormAnnotationControllerConstructParams) {
  const controller = new WebFormAnnotationController(opts);

  const userStore = useUserStore();
  const userName = userStore.getUserInfo.fullname;
  controller.userName = userName;

  return controller;
}
