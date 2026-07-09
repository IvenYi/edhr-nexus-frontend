import { MBRender } from '@gct/nocode-base';
import MaterialConsumeModal from './material-consume-modal.vue';
import { IOverlayContainer } from '@gct/runtime';

export class MbWebRender extends MBRender {
  /**
   * 所有打开的modal集合
   */
  modalHtml: IOverlayContainer;
  async openConsumeModal(data) {
    if (this.modalHtml) {
      return;
    }
    this.modalHtml = gct.openUtil.createModal(
      MaterialConsumeModal,
      {
        data,
      },
      {
        width: 640,
        draggable: true,
        showFooter: false,
        canFullscreen: false,
        mask: false,
        title: $t('sys.edhr.materialConsume'),
        wrapClassName: 'gct-draggable-modal',
      },
    );
    await this.modalHtml.present();
    await this.modalHtml.onWillDismiss();
    this.modalHtml = null;
  }

  destoryConsumeModal() {
    if (this.modalHtml) {
      this.modalHtml.dismiss();
      this.modalHtml = null;
    }
  }
}
