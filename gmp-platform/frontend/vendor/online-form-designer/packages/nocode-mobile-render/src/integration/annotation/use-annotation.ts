import {
  IFormAnnotationControllerConstructParams,
  FormAnnotationController,
} from '@gct/nocode-base';
import { showConfirmDialog, showNotify, showToast } from 'vant';
import { GctPopup } from '@mobile/utils/popup';
import FormAbandonV2Popup from './form-abandon-v2-popup.vue';
import FormMedproAbandonPopup from './form-medpro-abandon-popup.vue';
import { UserData } from '@mobile/stores/loginHooks';

export class MobileFormAnnotationController extends FormAnnotationController {
  override confirm(opts: { title: any; onOk: any; onCancel: any }) {
    showConfirmDialog({
      title: opts.title,
      confirmButtonText: $t('sys.okText'),
      cancelButtonText: $t('sys.cancelText'),
    })
      .then(() => {
        opts.onOk();
      })
      .catch(() => {
        opts.onCancel();
      });
  }
  override warn(str: string): void {
    showNotify({ type: 'warning', message: str });
  }

  override info(str: string): void {
    showToast(str);
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
      GctPopup.open(FormAbandonV2Popup, {
        docName: this.docName.value,
        isFormChange: opts.isFormChange,
        beforeClose: async (data) => {
          return resolve(data);
        },
      });
    });
  }

  override async openFormAbandonModal(): Promise<{
    reason: any;
    applicant: any;
    reviewer: any;
  } | void> {
    return new Promise((resolve, reject) => {
      GctPopup.open(FormMedproAbandonPopup, {
        docName: this.docName.value,
        beforeClose: async (data) => {
          return resolve(data);
        },
      });
    });
  }
}

/**
 * pad端的表单变更，批注逻辑
 * @export
 * @param opts
 * @return {*}
 */
export function useMobileAnnotation(opts: IFormAnnotationControllerConstructParams) {
  const controller = new MobileFormAnnotationController(opts);
  console.log('useMobileAnnotation', UserData.value);
  controller.userName = UserData.value.fullname!;

  return controller;
}
