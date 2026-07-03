import type { IBindField } from '@gct/nocode-base';
import { GctPopup } from '@mobile/utils/popup';
import PowerPopup from './power-popup.vue';

export type SaveDataObj = {
  base: number | undefined;
  exponent: number | undefined;
  value: number | undefined;
};

export async function openPowerPopup(
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
  return new Promise<{
    ok: boolean;
    value?: SaveDataObj;
  }>((resolve) => {
    GctPopup.open(PowerPopup, {
      value,
      fieldConfig,
      beforeClose: (data?: SaveDataObj) => {
        console.log('beforeClose', data);
        resolve({
          ok: !!data,
          value: data,
        });
      },
    });
  });
}
