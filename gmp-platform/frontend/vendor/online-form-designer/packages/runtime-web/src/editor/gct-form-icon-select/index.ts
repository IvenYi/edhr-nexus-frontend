import { widthEditorInstall, IEditorProvider, EditorType } from '@gct/runtime';
import { GctFormIconSelect } from './gct-form-icon-select';

export class Provider implements IEditorProvider {
  component = 'gct-form-icon-select';
}

export default widthEditorInstall(EditorType.ICON_SELECT, () => new Provider(), GctFormIconSelect);
