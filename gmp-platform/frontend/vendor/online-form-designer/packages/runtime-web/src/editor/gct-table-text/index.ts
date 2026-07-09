import { widthTableEditorInstall, EditorType } from '@gct/runtime';
import { GctTableTextProvider } from './gct-table-text.provider';
import { GctTableText } from './gct-table-text';

export default widthTableEditorInstall(
  EditorType.TEXT,
  () => new GctTableTextProvider(),
  GctTableText,
);
