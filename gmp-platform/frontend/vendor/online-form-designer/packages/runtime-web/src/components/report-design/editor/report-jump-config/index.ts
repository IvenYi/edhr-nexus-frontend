import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import { ReportJumpConfig } from './report-jump-config';
import { REPORT_EDITOR_TYPE } from '../../constants';

export class Provider implements IEditorProvider {
  component = 'report-jump-config';
}

export default widthEditorInstall(REPORT_EDITOR_TYPE.REPORT_JUMP_CONFIG, () => new Provider(), ReportJumpConfig);
