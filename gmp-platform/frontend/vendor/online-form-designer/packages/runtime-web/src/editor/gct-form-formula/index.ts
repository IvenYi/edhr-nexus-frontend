import { widthEditorInstall, EditorType, IEditorProvider } from '@gct/runtime';
import { GctFormFormula } from './gct-form-formula';

export class Provider implements IEditorProvider {
  component = 'gct-form-formula';
}

export default widthEditorInstall(EditorType.FORMULA, () => new Provider(), GctFormFormula);
