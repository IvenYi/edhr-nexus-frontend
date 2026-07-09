import { App } from "vue";
import CustomCalcMethod from './custom-calc-method';
import DataRulesConfig from './data-rules-config';
import PageSelectionConfig from './page-selection-config';
import ReportDrillConfig from './report-drill-config';
import ReportFieldConfig from './report-field-config';
import ReportJumpConfig from './report-jump-config';
import ReportJumpStyleConfig from './report-jump-style-config';
import ReportSortsEditor from './report-sorts-editor';
import RowColumnConversion from './row-column-conversion';
import RowHeightConfig from './row-height-config';
import SubtotalConfig from './subtotal-config';
import reportLevelHeaderConfig from './report-level-header-editor';
export default {
  install(app: App) {
    app.use(CustomCalcMethod);
    app.use(DataRulesConfig);
    app.use(PageSelectionConfig);
    app.use(ReportDrillConfig);
    app.use(ReportFieldConfig);
    app.use(ReportJumpStyleConfig);
    app.use(ReportJumpConfig);
    app.use(ReportSortsEditor);
    app.use(RowColumnConversion);
    app.use(RowHeightConfig);
    app.use(SubtotalConfig);
    app.use(reportLevelHeaderConfig);
  }
}
