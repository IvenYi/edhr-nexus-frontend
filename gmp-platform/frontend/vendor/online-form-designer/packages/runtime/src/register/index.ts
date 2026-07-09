import { DesignerRegister } from './designer-register/designer-register';
import { EditorRegister } from './editor-register/editor-register';
import { FormItemRegister } from './form-item-register/form-item-register';
import { RenderRegister } from './render-register/render-register';
import { TableEditorRegister } from './table-editor-register/table-editor-register';

export { EditorRegister } from './editor-register/editor-register';
export { FormItemRegister } from './form-item-register/form-item-register';
export { TableEditorRegister } from './table-editor-register/table-editor-register';

/**
 * 所有注册器
 */
export const allRegister = {
  designer: {
    pad: new DesignerRegister(),
    mobile: new DesignerRegister(),
    web: new DesignerRegister(),
  },
  render: {
    pad: new RenderRegister(),
    mobile: new RenderRegister(),
    web: new RenderRegister(),
  },
  editor: EditorRegister,
  tableEditor: TableEditorRegister,
  formItem: FormItemRegister,
};
