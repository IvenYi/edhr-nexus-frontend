import { RangeLimitType } from '/@online-form/views/designer/enums';
import RangeLimitModal from './rangelimit-modal.vue';

export type SaveDataObj = {
  type: RangeLimitType;
  min: number | undefined;
  max: number | undefined;
  standard: number | undefined;
};

export type LabelAlias = {
  upperLimit: string;
  lowerLimit: string;
  standard: string;
  upperTolerance: string;
  lowerTolerance: string;
};

export async function openRangeLimitModal(value?: SaveDataObj, alias?: Partial<LabelAlias>) {
  const result = await gct.openUtil.modal(
    RangeLimitModal,
    {
      value,
      alias,
    },
    { title: $t('sys.onlineForm.compositeFieldFillIn'), width: '700px' },
  );
  return {
    ok: result.ok,
    value: result.data?.[0] as SaveDataObj,
  };
}
