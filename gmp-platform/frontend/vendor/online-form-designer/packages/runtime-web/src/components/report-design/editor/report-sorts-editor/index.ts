import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import { ReportSortsEditor } from './report-sorts-editor';
import { REPORT_EDITOR_TYPE } from '../../constants';

export class Provider implements IEditorProvider {
  component = 'report-sorts-editor';
}

export default widthEditorInstall(REPORT_EDITOR_TYPE.REPORT_SORTS_EDITOR, () => new Provider(), ReportSortsEditor);
