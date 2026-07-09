import { IFormItemBasic, IFormGroup } from "@gct/runtime";

/**
 * 表单标题分组模型
 *
 * @export
 * @class GctFormTitleGroupModel
 * @implements {IFormGroup}
 */
export class GctFormTitleGroupModel implements IFormGroup {
  type: "group" = 'group';

  isContainer: true = true;

  layout: "flex" | "grid" = 'grid';

  children: IFormItemBasic[] = [];

  name: string;

  title?: string;

  showHeader?: boolean;

  isCollapse?: boolean;

  constructor(name: string, opts: Partial<IFormGroup>, children: IFormItemBasic[]) {
    this.name = name;
    if (opts) {
      Object.assign(this, opts);
    }
    if (children) {
      this.children = children;
    }
  }
}
