import { IFormCollapse, IFormCollapsePane } from "@gct/runtime";

/**
 * 表单折叠面板模型
 *
 * @export
 * @class GctFormCollapseModel
 * @implements {IFormCollapse}
 */
export class GctFormCollapseModel implements IFormCollapse {
  type: "collapse" = 'collapse';

  isContainer: true = true;

  layout: "flex" | "grid" = 'grid';

  children: IFormCollapsePane[] = [];

  name: string;

  accordion?: boolean;

  expandIconPosition?: 'left' | 'right';

  expandIconStyle?: 'down-right' | 'up-down';

  constructor(name: string, opts: Partial<IFormCollapse>, children: IFormCollapsePane[]) {
    this.name = name;
    if (opts) {
      Object.assign(this, opts);
    }
    if (children) {
      this.children = children;
    }
  }
}
