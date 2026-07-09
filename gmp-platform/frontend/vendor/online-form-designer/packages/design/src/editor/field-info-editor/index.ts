import { widthEditorInstall, EditorType, IEditorProvider } from '@gct/runtime';
import { FieldInfoEditor } from './field-info-editor';

export class Provider implements IEditorProvider {
  component = 'FieldInfoEditor';
}

export default widthEditorInstall(EditorType.FIELD_INFO, () => new Provider(), FieldInfoEditor);
