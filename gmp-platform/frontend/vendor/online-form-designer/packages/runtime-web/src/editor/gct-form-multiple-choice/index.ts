import { widthEditorInstall, EditorType } from '@gct/runtime';
import { IEditorProvider } from '@gct-paas/core';
import { GctFormMultipleChoice } from './gct-form-multiple-choice';

export class provider implements IEditorProvider {
  component = 'GctFormMultipleChoice';
}

export default widthEditorInstall(
  EditorType.MULTIPLE_CHOICE,
  () => new provider(),
  GctFormMultipleChoice,
);
