import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import { RowHeightConfig } from './row-height-config';
import { REPORT_EDITOR_TYPE } from '../../constants';

export class Provider implements IEditorProvider {
  component = 'row-height-config';
}

export default widthEditorInstall(REPORT_EDITOR_TYPE.ROW_HEIGHT_CONFIG, () => new Provider(), RowHeightConfig);
