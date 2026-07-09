import { widthEditorInstall, EditorType, IEditorProvider } from '@gct/runtime';
import { ModelFieldSelect } from './model-field-select';

export class Provider implements IEditorProvider {
  component = 'ModelFieldSelect';
}

export default widthEditorInstall(
  EditorType.FORM_MODEL_FIELD_SELECT,
  () => new Provider(),
  ModelFieldSelect,
);
