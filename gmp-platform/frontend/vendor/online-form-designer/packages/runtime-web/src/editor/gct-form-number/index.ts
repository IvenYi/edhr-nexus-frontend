import { widthEditorInstall, EditorType } from '@gct/runtime';
import { GctFormNumberProvider } from './gct-form-number.provider';
import { GctFormNumber } from './gct-form-number';

export default widthEditorInstall(
  EditorType.NUMBER,
  () => new GctFormNumberProvider(),
  GctFormNumber,
);
