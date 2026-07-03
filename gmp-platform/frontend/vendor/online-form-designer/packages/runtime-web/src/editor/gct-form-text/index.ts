import { widthEditorInstall, EditorType } from '@gct/runtime';
import { GctFormTextProvider } from './gct-form-text.provider';
import { GctFormText } from './gct-form-text';

export default widthEditorInstall(EditorType.TEXT, () => new GctFormTextProvider(), GctFormText);
