import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
import { CellWidgetRenderComp, CellWidgetCategory } from '/@online-form/views/designer/enums';
import {
  SignatureTypeEnum,
  SignShowTypeEnum,
  SignatureTimeTypeEnum,
  SignatureNumberTypeEnum,
} from '@gct/nocode-base';

export const config: CellWidget.Signature = {
  category: CellWidgetCategory.Signature,
  renderComp: CellWidgetRenderComp.Signature,
  signatureType: SignatureTypeEnum.SIGNATURE_ONLY,
  signDisplayStyle: SignShowTypeEnum.VERTICAL,
  signTimeType: SignatureTimeTypeEnum.FOLLOW_SIGNATURE,
  populateFields: [],
  signatureNumber: SignatureNumberTypeEnum.SIGNATURE_MULTIPLE,
};
