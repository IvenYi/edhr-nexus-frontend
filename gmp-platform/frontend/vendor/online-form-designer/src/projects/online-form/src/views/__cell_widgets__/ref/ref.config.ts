import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
import { CellWidgetRenderComp, CellWidgetCategory } from '/@online-form/views/designer/enums';

export const config: CellWidget.Ref = {
  category: CellWidgetCategory.Ref,
  renderComp: CellWidgetRenderComp.Ref,
  searchField: [],
  dataFilter: {
    dataRule: '',
    dataRuleConfig: '',
    dataRuleEnabled: true,
  },
  autofillRules: [],
};
