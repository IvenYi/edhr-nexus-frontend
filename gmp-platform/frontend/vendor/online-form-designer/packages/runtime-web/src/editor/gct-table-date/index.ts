import { widthTableEditorInstall, EditorType } from '@gct/runtime';
import { GctTableDateProvider } from './gct-table-date.provider';
import { GctTableDate } from './gct-table-date';

export default widthTableEditorInstall(
  EditorType.DATE,
  () => new GctTableDateProvider(),
  GctTableDate,
);
