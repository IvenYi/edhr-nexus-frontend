import { widthEditorInstall, EditorType } from '@gct/runtime';
import { GctFormPickerProvider } from './gct-form-picker.provider';
import { GctFormPicker } from './gct-form-picker';

export default widthEditorInstall(
  EditorType.PICKER,
  () => new GctFormPickerProvider(),
  GctFormPicker,
);
