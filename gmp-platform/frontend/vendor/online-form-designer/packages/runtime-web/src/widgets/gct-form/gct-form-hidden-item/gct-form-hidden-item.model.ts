import { IFormHiddenItem } from "@gct/runtime";

/**
 * 表单隐藏项模型
 *
 * @export
 * @class GctFormHiddenItemModel
 * @implements {IFormHiddenItem}
 */
export class GctFormHiddenItemModel implements IFormHiddenItem {
  type: "hidden" = 'hidden';

  name: string;

  field?: string;

  defaultValue?: any;

  editor: any;

  constructor(name: string, options?: Partial<IFormHiddenItem>) {
    this.name = name;
    if (options) {
      Object.assign(this, options);
    }
  }
}
