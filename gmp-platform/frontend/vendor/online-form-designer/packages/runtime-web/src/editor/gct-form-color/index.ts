import { widthEditorInstall, EditorType } from '@gct/runtime';
import { GctFormColor } from './gct-form-color';
import { GctFormColorProvider } from './gct-form-color.provider';

export default widthEditorInstall(EditorType.COLOR, () => new GctFormColorProvider(), GctFormColor);
