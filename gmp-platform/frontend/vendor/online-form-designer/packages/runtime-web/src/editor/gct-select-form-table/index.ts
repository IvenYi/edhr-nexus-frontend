import { widthEditorInstall, EditorType } from '@gct/runtime';
import { IEditorProvider } from '@gct/runtime';
import { GctSelectFormTable } from './gct-select-form-table';

export class Provider implements IEditorProvider {
  component = 'gct-select-form-table';
}

export default widthEditorInstall(EditorType.SELECT_TABLE, () => new Provider(), GctSelectFormTable);
