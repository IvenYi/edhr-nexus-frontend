import { IFormItemBasic, IFormTabPane } from "@gct/runtime";

/**
 * 表单选项卡面板模型
 *
 * @export
 * @class GctFormTabPaneModel
 * @implements {IFormTabPane}
 */
export class GctFormTabPaneModel implements IFormTabPane {
  type: "tab-pane" = 'tab-pane';

  isContainer: true = true;

  title: string;

  layout: "flex" | "grid" = 'grid';

  children: IFormItemBasic[] = [];

  name: string;

  constructor(name: string, title: string, opts: Partial<IFormTabPane>, children: IFormItemBasic[]) {
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
