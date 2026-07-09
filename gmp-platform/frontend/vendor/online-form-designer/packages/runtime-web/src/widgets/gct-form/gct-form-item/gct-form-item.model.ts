import { IFormItem, IEditorBasic } from "@gct/runtime";
import type { RuleObject } from "ant-design-vue/es/form";

/**
 * 表单项模型
 *
 * @export
 * @class GctFormItemModel
 * @implements {IFormItem}
 */
export class GctFormItemModel implements IFormItem {
  type: "item" = 'item';

  name: string;

  editor: IEditorBasic;

  label?: string;

  rules?: RuleObject[];

  constructor(name: string, label: string, opts: Partial<IFormItem>, editor: IEditorBasic) {
    this.name = name;
    if (label) {
      this.label = label;
    }
    if (opts) {
      Object.assign(this, opts);
    }
    this.editor = editor;
  }
}
