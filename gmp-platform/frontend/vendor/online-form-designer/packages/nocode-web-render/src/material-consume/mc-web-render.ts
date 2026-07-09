import { MCRender } from '@gct/nocode-base';
import ScanModal from './scan-modal.vue';
import BomModal from './bom-modal.vue';
import { message } from 'ant-design-vue';
import ChangeRuleModal from './change-rule-modal.vue';
import { IOverlayContainer } from '@gct/runtime';

export class McWebRender extends MCRender {
  /**
   * 所有打开的modal集合
   */
  modals: Array<IOverlayContainer> = [];

  async handleModal(modal: IOverlayContainer) {
    this.modals.push(modal);
    await modal.present();
    await modal.onWillDismiss();
    this.modals = this.modals.filter((item) => item !== modal);
  }

  override destroyAllModals(): void {
    for (const modal of this.modals) {
      modal.dismiss();
    }
    this.modals = [];
  }

  override message(opts: { type: 'error' | 'warning'; content: string }): void {
    message.open(opts);
  }

  override async _openBomModal(opts: { bomList: any[]; onSubstitute: Function }) {
    const modal = gct.openUtil.createModal(
      BomModal,
      {
        opts: opts,
      },
      { mask: false },
    );
    await this.handleModal(modal);
  }

  override async openScanModal(opts: { title: string; onScan: (str: string) => void }) {
    const modal = gct.openUtil.createModal(
      ScanModal,
      {
        onScan: opts.onScan,
      },
      { title: opts.title, mask: false },
    );
    await this.handleModal(modal);
  }

  override async openChangeRuleModal(opts: { id: string }): Promise<string | undefined> {
    const res = await gct.openUtil.modal(
      ChangeRuleModal,
      {
        id: opts.id,
      },
      {
        title: $t('sys.edhr.mcTable.modifyParseRule'),
      },
    );
    if (res.ok && res.data) {
      return res.data;
    }
  }
}
