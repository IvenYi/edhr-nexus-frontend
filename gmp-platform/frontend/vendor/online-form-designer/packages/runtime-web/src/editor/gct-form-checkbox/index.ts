import { widthEditorInstall, EditorType, IEditorProvider } from '@gct/runtime';
import { GctFormCheckbox } from './gct-form-checkbox';

export class Provider implements IEditorProvider {
  component = 'gct-form-checkbox';
}

export default widthEditorInstall(EditorType.CHECKBOX, () => new Provider(), GctFormCheckbox);
