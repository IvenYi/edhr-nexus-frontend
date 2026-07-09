import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import { ReportDrillConfig } from './report-drill-config';
import { REPORT_EDITOR_TYPE } from '../../constants';

export class Provider implements IEditorProvider {
  component = 'report-drill-config';
}

export default widthEditorInstall(REPORT_EDITOR_TYPE.REPORT_DRILL_CONFIG, () => new Provider(), ReportDrillConfig);
