import { widthEditorInstall, EditorType } from '@gct/runtime';
import { GctFormDateProvider } from './gct-form-date.provider';
import { GctFormDate } from './gct-form-date';

export default widthEditorInstall(EditorType.DATE, () => new GctFormDateProvider(), GctFormDate);
