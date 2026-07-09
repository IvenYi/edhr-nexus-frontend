import { widthTableEditorInstall, EditorType } from '@gct/runtime';
import { GctTableSpanProvider } from './gct-table-span.provider';
import { GctTableSpan } from './gct-table-span';

export default widthTableEditorInstall(
  EditorType.SPAN,
  () => new GctTableSpanProvider(),
  GctTableSpan,
);
