import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import { ReportJumpStyleConfig } from './report-jump-style-config';
import { REPORT_EDITOR_TYPE } from '../../constants';

export class Provider implements IEditorProvider {
  component = 'report-jump-style-config';
}

export default widthEditorInstall(REPORT_EDITOR_TYPE.REPORT_JUMP_STYLE_CONFIG, () => new Provider(), ReportJumpStyleConfig);
