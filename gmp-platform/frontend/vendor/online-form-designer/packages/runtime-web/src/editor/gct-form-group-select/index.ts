import { widthEditorInstall, EditorType, IEditorProvider } from '@gct/runtime';
import { GctFormSelectGroup } from './gct-form-group-select';

export class provider implements IEditorProvider {
  component = 'gct-form-select-group';
}

export default widthEditorInstall(
  EditorType.SELECT_GROUP,
  () => new provider(),
  GctFormSelectGroup,
);
