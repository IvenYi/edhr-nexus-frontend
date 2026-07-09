import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import { ReportLevelHeaderEditor } from './report-level-header-editor';
import { REPORT_EDITOR_TYPE } from '../../constants';

export class Provider implements IEditorProvider {
  component = 'report-level-header-editor';
}

export default widthEditorInstall(REPORT_EDITOR_TYPE.REPORT_LEVEL_HEADER, () => new Provider(), ReportLevelHeaderEditor);
