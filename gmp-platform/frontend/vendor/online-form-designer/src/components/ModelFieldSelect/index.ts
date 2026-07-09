import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import ModelFieldSelect from './ModelFieldSelect.vue';

export class ModelFieldSelectProvider implements IEditorProvider {
  component = 'model-field-select';
}

export default widthEditorInstall(
  'model-field-select',
  () => new ModelFieldSelectProvider(),
  ModelFieldSelect,
);
