import { widthEditorInstall, EditorType } from '@gct/runtime';
import { GctFormTextareaProvider } from './gct-form-textarea.provider';
import { GctFormTextarea } from './gct-form-textarea';

export default widthEditorInstall(
  EditorType.TEXTAREA,
  () => new GctFormTextareaProvider(),
  GctFormTextarea,
);
