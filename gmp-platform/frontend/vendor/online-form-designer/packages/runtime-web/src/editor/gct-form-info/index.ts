import { widthEditorInstall, EditorType, IEditorProvider } from '@gct/runtime';
import { GctFormInfo } from './gct-form-info';

export class Provider implements IEditorProvider {
  component = 'gct-form-info';
}

export default widthEditorInstall(EditorType.INFO, () => new Provider(), GctFormInfo);
