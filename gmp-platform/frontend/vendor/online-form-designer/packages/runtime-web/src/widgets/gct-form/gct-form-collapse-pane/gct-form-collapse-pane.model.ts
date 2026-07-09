import { IFormItemBasic, IFormCollapsePane } from "@gct/runtime";

/**
 * 表单折叠面板项模型
 *
 * @export
 * @class GctFormCollapsePaneModel
 * @implements {IFormCollapsePane}
 */
export class GctFormCollapsePaneModel implements IFormCollapsePane {
  type: "collapse-pane" = 'collapse-pane';

  isContainer: true = true;

  title: string;

  layout: "flex" | "grid" = 'grid';

  children: IFormItemBasic[] = [];

  name: string;

  collapsible?: boolean;

  constructor(name: string, title: string, opts: Partial<IFormCollapsePane>, children: IFormItemBasic[]) {
    this.name = name;
    this.title = title;
    if (opts) {
      Object.assign(this, opts);
    }
    if (children) {
      this.children = children;
    }
  }
}
