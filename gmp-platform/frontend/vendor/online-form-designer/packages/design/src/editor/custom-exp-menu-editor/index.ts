import { widthEditorInstall } from '@gct/runtime';
import { DesignEditorType } from '../../constant';
import { CustomExpMenuEditor } from './custom-exp-menu-editor';
import { ChildListEditorProvider } from './custom-exp-menu-editor.provider';

export default widthEditorInstall(
  DesignEditorType.CUSTOM_EXP_MENU,
  () => new ChildListEditorProvider(),
  CustomExpMenuEditor,
);

export type { ICustomExpMenuModel } from './i-custom-exp-menu-model';
