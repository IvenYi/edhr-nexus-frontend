import { widthEditorInstall, EditorType } from '@gct/runtime';
import { IEditorProvider } from '@gct/runtime';
import { GctFormTable } from './gct-form-table';

export class Provider implements IEditorProvider {
  component = 'gct-form-table';
}

export default widthEditorInstall(EditorType.TABLE, () => new Provider(), GctFormTable);
