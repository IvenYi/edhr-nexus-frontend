import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import { ReportFieldConfig } from './report-field-config';
import { REPORT_EDITOR_TYPE } from '../../constants';

export class Provider implements IEditorProvider {
  component = 'report-field-config';
}

export default widthEditorInstall(REPORT_EDITOR_TYPE.REPORT_FIELD_CONFIG, () => new Provider(), ReportFieldConfig);
