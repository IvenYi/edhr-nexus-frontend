import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import ModelPicker from './ModelPicker.vue';

export class ModelPickerProvider implements IEditorProvider {
  component = 'model-picker';
}

export default widthEditorInstall('model-picker', () => new ModelPickerProvider(), ModelPicker);
