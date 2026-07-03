import { widthEditorInstall, EditorType, IEditorProvider } from '@gct/runtime';
import { GctFormRadio } from './gct-form-radio';

export class Provider implements IEditorProvider {
  component = 'gct-form-radio';
}

export default widthEditorInstall(EditorType.RADIO, () => new Provider(), GctFormRadio);
