import { widthEditorInstall, EditorType } from '@gct/runtime';
import { IEditorProvider } from '@gct-paas/core';
import { GctFormAction } from './gct-form-action';

export class provider implements IEditorProvider {
  component = 'gct-form-action';
}

export default widthEditorInstall(
  EditorType.ACTION,
  () => new provider(),
  GctFormAction,
);
