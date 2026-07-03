import { widthEditorInstall } from '@gct/runtime';
import { DesignEditorType } from '../../constant';
import { ChildListEditor } from './child-list-editor';
import { ChildListEditorProvider } from './child-list-editor.provider';

export default widthEditorInstall(
  DesignEditorType.CHILD_LIST_EDITOR,
  () => new ChildListEditorProvider(),
  ChildListEditor,
);
