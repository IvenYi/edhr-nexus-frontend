import { IFormTab, IFormTabPane } from "@gct/runtime";

export class GctFormTabModel implements IFormTab {
  type: "tab" = 'tab';

  isContainer: true = true;

  children: IFormTabPane[] = [];

  layout: "flex" | "grid" = 'grid';

  navPosition: "center" | "left" | "right" = 'center';

  name: string;

  constructor(name: string, opts: Partial<IFormTab>, children: IFormTabPane[]) {
    this.name = name;
    if (opts) {
      Object.assign(this, opts);
    }
    if (children) {
      this.children = children;
    }
  }
}
