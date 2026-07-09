import PowerModal from './power-modal.vue';
import { IModalData } from '@gct/runtime';
import type { IBindField } from '@gct/nocode-base';

export type SaveDataObj = {
  base: number | undefined;
  exponent: number | undefined;
  value: number | undefined;
};

export async function openPowerModal(
  fieldConfig: {
    /** 基数 */
    baseValueField?: IBindField;
    /** 指数 */
    exponentValueField?: IBindField;
    /** 真实值 */
    valueField?: IBindField;
  },
  value?: SaveDataObj,
) {
  const result = await gct.openUtil.modal<IModalData>(
    PowerModal,
    {
      value,
      fieldConfig,
    },
    { title: $t('sys.onlineForm.powerComp.modalTitle'), width: '700px' },
  );
  return {
    ok: result.ok,
    value: result.data?.[0] as SaveDataObj,
  };
}
