import { widthEditorInstall, EditorType, IEditorProvider } from '@gct/runtime';
import { GctFormEmpty } from './gct-form-empty';

export class provider implements IEditorProvider {
  component = 'gct-form-empty';
}

export default widthEditorInstall(
  EditorType.EMPTY,
  () => new provider(),
  GctFormEmpty,
);
