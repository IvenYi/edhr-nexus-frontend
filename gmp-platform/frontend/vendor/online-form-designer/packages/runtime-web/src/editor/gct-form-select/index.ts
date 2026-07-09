import { widthEditorInstall, EditorType } from '@gct/runtime';
import { GctFormSelectProvider } from './gct-form-select.provider';
import { GctFormSelect } from './gct-form-select';

export default widthEditorInstall(
  EditorType.SELECT,
  () => new GctFormSelectProvider(),
  GctFormSelect,
);
