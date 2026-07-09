import { widthEditorInstall, EditorType, IEditorProvider } from '@gct/runtime';
import { GctFormDateFormatSelect } from './gct-form-date-format-select';

export class Provider implements IEditorProvider {
  component = 'gct-form-date-format-select';
}

export default widthEditorInstall(
  EditorType.DATE_FORMAT_SELECT,
  () => new Provider(),
  GctFormDateFormatSelect,
);
