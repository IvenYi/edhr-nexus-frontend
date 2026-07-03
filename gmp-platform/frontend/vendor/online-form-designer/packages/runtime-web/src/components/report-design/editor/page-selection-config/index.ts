import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import { PageSelectionConfig } from './page-selection-config';
import { REPORT_EDITOR_TYPE } from '../../constants';

export class Provider implements IEditorProvider {
  component = 'page-selection-config';
}

export default widthEditorInstall(REPORT_EDITOR_TYPE.PAGE_SELECTION_CONFIG, () => new Provider(), PageSelectionConfig);
