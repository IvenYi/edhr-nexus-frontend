import { DesignNodeMode, IDesignNode, IDesignNodeData, IDesignTreeItem } from '@gct/base';
import {
  IDesignRenderBaseController,
  IDesignRenderController,
  IDesignRenderState,
} from '../../interface';
import { DesignRenderState } from '../../state';
import { RenderNodeRegister } from '../../register';
import { DesignRenderBaseController } from '../design-render-base/design-render-base.controller';
import { DesignRenderContainerController } from '../design-render-container/design-render-container.controller';
import { DesignRenderItemController } from '../design-render-item/design-render-item.controller';

export class DesignRenderController implements IDesignRenderController {
  state: IDesignRenderState = new DesignRenderState();

  prefix: string = '';

  preview: boolean = false;

  readonly item: Map<string, IDesignRenderBaseController> = new Map();

  protected nodes: IDesignNode<IDesignNodeData>[] = [];

  protected tree: IDesignTreeItem[] = [];

  setTree(tree: IDesignTreeItem[]): void {
    this.tree = tree;
  }

  setNodes(nodes: IDesignNode<IDesignNodeData>[]): void {
    this.reset();
    this.nodes = nodes;
    this.nodes.forEach((node) => {
      const provider = RenderNodeRegister.get(node.type, this.prefix);
      if (provider) {
        if (provider.createController) {
          this.item.set(node.id, provider.createController(node));
          return;
        }
        if (provider.mode === DesignNodeMode.CONTAINER) {
          this.item.set(node.id, new DesignRenderContainerController(node));
          return;
        }
        if (provider.mode === DesignNodeMode.ITEM) {
          this.item.set(node.id, new DesignRenderItemController(node));
          return;
        }
      }
      this.item.set(node.id, new DesignRenderBaseController(node));
    });
  }

  getNodes(parentId?: string): IDesignNode[] {
    if (parentId) {
      const item = this.getTreeItem(parentId);
      if (item && item.children) {
        return item.children.map((_) => {
          return this.nodes.find((node) => _.id === node.id)!;
        });
      } else {
        return [];
      }
    } else {
      return this.tree.map((_) => {
        return this.nodes.find((node) => _.id === node.id)!;
      });
    }
  }

  protected getTreeItem(tag: string, items = this.tree): IDesignTreeItem | null {
    if (!tag) {
      return null;
    }
    for (let i = 0; i < items.length; i++) {
      const _ = items[i];
      if (_.id === tag) {
        return _;
      }
      if (_.children && _.children.length > 0) {
        const item = this.getTreeItem(tag, _.children);
        if (item) {
          return item;
        }
      }
    }
    return null;
  }

  getController(id: string): IDesignRenderBaseController {
    return this.item.get(id)!;
  }

  mounted(): void {
    // TODO
  }

  unmounted(): void {
    this.reset();
  }

  protected reset(): void {
    this.nodes = [];
    this.item.forEach((controller) => {
      controller.destroy();
    });
  }
}
