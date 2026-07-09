import { widthEditorInstall, EditorType, IEditorProvider } from '@gct/runtime';
import { GctFormModelSelect } from './gct-form-model-select';

export class Provider implements IEditorProvider {
  component = 'gct-form-model-select';
}

export default widthEditorInstall(EditorType.MODEL_SELECT, () => new Provider(), GctFormModelSelect);
