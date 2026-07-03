import { IFormItemBasic, IFormGroup } from "@gct/runtime";

/**
 * 表单分组模型
 *
 * @export
 * @class GctFormGroupModel
 * @implements {IFormGroup}
 */
export class GctFormGroupModel implements IFormGroup {
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
