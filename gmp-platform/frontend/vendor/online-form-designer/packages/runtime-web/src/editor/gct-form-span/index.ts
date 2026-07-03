import { widthEditorInstall, EditorType } from '@gct/runtime';
import { GctFormSpanProvider } from './gct-form-span.provider';
import { GctFormSpan } from './gct-form-span';

export default widthEditorInstall(EditorType.SPAN, () => new GctFormSpanProvider(), GctFormSpan);
