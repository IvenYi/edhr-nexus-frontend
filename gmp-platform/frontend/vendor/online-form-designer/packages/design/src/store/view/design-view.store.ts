import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { IDesignNode, IDesignPageNodeData, IDesignTreeItem, LinkedList } from '@gct/base';
import { uuid } from '@jsplumb/browser-ui';
import { cloneDeep, merge } from 'lodash-es';
import { IDesignViewState, IDesignViewActions } from '../../interface';
import { DesignNodeType, DesignViewPrefix, InsertNodeMode } from '../../constant';
import { NodeRegister } from '../../register';

/**
 * 设计视图状态
 */
export const useDesignViewStore = () => {
  const key = 'design-view___' + uuid();
  return defineStore<string, IDesignViewState, {}, IDesignViewActions>(key, {
    state() {
      return {
        uuid: key,
        rootExpLabel: '页面',
        prefix: DesignViewPrefix.CUSTOM_HOME,
        isTriggerCache: true,
        map: new Map<string, IDesignNode>(),
        pageNode: null,
        selected: null,
        hoverId: null,
        isDragging: false,
        isChange: false,
        history: new LinkedList(),
        count: 0,
        tree: [],
        expansions: new Set(),
        dropContainer: null,
      };
    },
    actions: {
      getParentKey(id, parent = null, items = []) {
        if (!id) {
          return null;
        }
        if (items.length === 0) {
          items = this.tree;
        }
        for (let i = 0; i < items.length; i++) {
          const _ = items[i];
          if (_.id === id) {
            return parent ? parent.id : null;
          }
          if (_.children && _.children.length > 0) {
            const result = this.getParentKey(id, _, _.children);
            if (result) {
              return result;
            }
          }
        }
        return null;
      },
      getTreeItem(tag: string, items = []) {
        if (!tag) {
          return null;
        }
        if (items.length === 0) {
          items = this.tree;
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
      },
      getTreeItems(tag) {
        let items = this.tree;
        const treeItem = this.getTreeItem(tag);
        if (treeItem) {
          if (!treeItem.children) {
            treeItem.children = [];
          }
          items = treeItem.children;
        }
        return items;
      },
      getChildren(node?: IDesignNode | string) {
        if (node) {
          const tag = typeof node === 'string' ? node : node.id;
          const item = this.getTreeItem(tag);
          if (item && item.children) {
            return item.children.map((_) => this.map.get(_.id)!);
          }
        } else {
          // 根一层节点
          return this.tree.map((_) => {
            return this.map.get(_.id)!;
          });
        }
        return [];
      },
      setDragging(bol) {
        this.isDragging = bol;
      },
      activePage() {
        this.selected = this.pageNode;
      },
      setActive(node: string | IDesignNode | null) {
        if (node == null) {
          this.selected = null;
        } else if (typeof node === 'string') {
          if (this.map.has(node)) {
            this.selected = this.map.get(node)!;
          } else {
            console.warn(`节点[${node}]不存在`);
          }
        } else {
          this.selected = node;
        }
      },
      getNode(tag: string): IDesignNode | null {
        if (this.map.has(tag)) {
          return this.map.get(tag)!;
        }
        return null;
      },
      updateNode(node) {
        if (
          node &&
          (node.type === DesignNodeType.PAGE || node.type === DesignNodeType.PAGE_LOWER)
        ) {
          this.pageNode = merge(this.pageNode, node);
          this.pageNode.updateDate = Date.now();
          this.isChange = true;
          this.countAdd();
          return;
        }
        if (!this.map.has(node.id)) {
          node.updateDate = Date.now();
          this.map.set(node.id, cloneDeep(node));
        } else {
          const data = this.map.get(node.id)!;
          node.updateDate = Date.now();
          this.map.set(node.id, merge(data, node));
        }
        this.isChange = true;
      },
      setNode(pKey, node, index) {
        if (
          node &&
          (node.type === DesignNodeType.PAGE || node.type === DesignNodeType.PAGE_LOWER)
        ) {
          this.pageNode = merge(this.pageNode, node);
          this.pageNode.updateDate = Date.now();
          this.isChange = true;
          this.countAdd();
          return node;
        }
        if (!pKey) {
          pKey = this.getParentKey(node.id)!;
        }
        const nodes: IDesignNode[] = this.getChildren(pKey);
        let isNew = false;
        if (!this.map.has(node.id)) {
          node.updateDate = Date.now();
          isNew = true;
        } else {
          const data = this.map.get(node.id)!;
          node.updateDate = Date.now();
          Object.assign(data, node);
          node = data;
        }
        this.map.set(node.id, node);
        if (nodes.length > 0 && index != null && index >= 0) {
          this.insertNode(InsertNodeMode.BEFORE, nodes[index], node);
        } else if (isNew) {
          this.setTreeItem(pKey, node.id, index);
          this.cacheHistory();
        }
        this.isChange = true;
        this.countAdd();
        return node;
      },
      setTreeItem(pKey: string, id: string, i?: number) {
        const items = this.getTreeItems(pKey);
        if (i != null) {
          items.splice(i, 0, {
            id,
          });
        } else {
          items.push({
            id,
          });
        }
      },
      moveTreeItem(oldPid, newPid, id, i?) {
        // 若父节点相同，则在同一组上移动逻辑
        if (oldPid === newPid) {
          const items = this.getTreeItems(newPid);
          const oldIndex = items.findIndex((_) => _.id === id);
          // 是否存在旧数据
          if (oldIndex !== -1) {
            // 新旧位置相同认为没有移动
            if (oldIndex === i) {
              return;
            }
            const item = items[oldIndex];
            if (i != null) {
              if (i < oldIndex) {
                // 放置在旧数据之前，先删除再插入。避免插入位置异常
                items.splice(oldIndex, 1);
                items.splice(i, 0, item);
              } else {
                // 放置在旧数据之后，先插入再删除。避免插入位置异常
                items.splice(i, 0, item);
                items.splice(oldIndex, 1);
              }
            } else {
              // 未指定位置，挪至最后
              items.splice(oldIndex, 1);
              items.push(item);
            }
          } else {
            // 不存在直接新增
            if (i != null) {
              // 新增至指定位置
              items.splice(i, 0, {
                id,
              });
            } else {
              items.push({
                id,
              });
            }
          }
          return;
        }
        // 要挪出的旧组
        const oldItems = this.getTreeItems(oldPid);
        // 要放入的新组
        const newItems = this.getTreeItems(newPid);
        // 旧组中是否存在数据，不存在则认为是新建
        const oldIndex = oldItems.findIndex((_) => _.id === id);
        if (oldIndex === -1) {
          this.setTreeItem(newPid, id, i);
        } else {
          const item = oldItems[oldIndex];
          // 从旧组删除
          oldItems.splice(oldIndex, 1);
          // 放入新组，未指定位置时放入最后
          if (i != null) {
            newItems.splice(i, 0, item);
          } else {
            newItems.push(item);
          }
        }
      },
      deleteNode(arg): IDesignNode | null {
        const tag = typeof arg === 'string' ? arg : arg.id;
        const data = this.getNode(tag);
        if (data) {
          const pKey = this.getParentKey(data.id)!;
          const items = this.getTreeItems(pKey);
          const i = items!.findIndex((_) => _.id === data.id);
          if (i !== -1) {
            items!.splice(i, 1);
          }
          this.map.delete(data.id);
        }
        this.isChange = true;
        this.countAdd();
        this.cacheHistory();
        return data;
      },
      setNodes(nodes) {
        nodes.forEach((node) => {
          const p = NodeRegister.get(node.type, this.prefix);
          if (p) {
            const data = p.create(node);
            if (data) {
              this.map.set(data.id, data);
            }
          } else {
            console.warn(`节点类型[${node.type}]，未注册适配器`);
          }
        });
      },
      insertNode(mode, node, data) {
        const oldPKey = this.getParentKey(data.id)!;
        const newPKey = this.getParentKey(node.id)!;
        const id = data.id;
        // 找出要插入的位置的组
        const items = this.getTreeItems(newPKey);
        // 要插入节点的位置
        const index = items.findIndex((_) => _.id === node.id);
        switch (mode) {
          case InsertNodeMode.BEFORE: {
            this.moveTreeItem(oldPKey, newPKey, id, index);
            break;
          }
          case InsertNodeMode.AFTER: {
            this.moveTreeItem(oldPKey, newPKey, id, index + 1);
            break;
          }
          default:
        }
        this.map.set(data.id, data);
        this.isChange = true;
        this.countAdd();
        this.cacheHistory();
        return true;
      },
      setData: async function (data) {
        if (data) {
          if (!data.pageNode) {
            const p =
              NodeRegister.get(DesignNodeType.PAGE, this.prefix) ||
              NodeRegister.get(DesignNodeType.PAGE_LOWER, this.prefix);
            if (p) {
              const node = p.create() as IDesignNode<IDesignPageNodeData>;
              this.pageNode = reactive(node);
              this.pageNode.data = reactive(this.pageNode.data || {});
            } else {
              console.warn(`节点类型[${DesignNodeType.PAGE}]，未注册适配器`);
            }
          } else {
            this.pageNode = reactive(data.pageNode);
            this.pageNode.data = reactive(this.pageNode.data || {});
          }
          this.setNodes(data.nodes);
          this.selected = this.pageNode;

          // 旧数据兼容转换
          if (data.nodes && data.nodes.length > 0 && (!data.tree || data.tree.length === 0)) {
            const structureTree = (items: IDesignNode[]): IDesignTreeItem[] => {
              const arr: IDesignTreeItem[] = [];
              items.forEach((item) => {
                const children = data.nodes
                  .filter((_) => _.parentId === item.id)
                  .sort((a, b) => a.order! - b.order!);
                if (children.length > 0) {
                  arr.push({
                    id: item.id,
                    children: structureTree(children),
                  });
                } else {
                  arr.push({
                    id: item.id,
                  });
                }
              });
              return arr;
            };
            this.tree = structureTree(
              data.nodes.filter((_) => !_.parentId).sort((a, b) => a.order! - b.order!),
            );
          } else {
            this.tree = data.tree || [];
          }
          this.cacheHistory();
        }
      },
      getData() {
        const deep = (items: IDesignTreeItem[]): string[] => {
          const arr: string[] = [];
          if (items && items.length > 0) {
            items.forEach((item) => {
              arr.push(item.id);
              if (item.children && item.children.length > 0) {
                const childArr = deep(item.children);
                arr.push(...childArr);
              }
            });
          }
          return arr;
        };
        // 递归展开结构树并返回所有树节点的 id 数组
        const keys = deep(this.tree);
        const nodes = cloneDeep(Array.from(this.map.values())).filter((_) => {
          return keys.includes(_.id);
        });
        return {
          type: this.prefix,
          pageNode: cloneDeep(this.pageNode),
          nodes,
          tree: cloneDeep(this.tree),
        };
      },
      getPaths(id: string): IDesignNode[] {
        const arr: IDesignNode[] = [];
        let node = this.getNode(id);
        if (node) {
          arr.push(node);
          let pKey = this.getParentKey(node.id);
          while (pKey) {
            node = this.getNode(pKey);
            if (!node) {
              break;
            }
            arr.unshift(node);
            pKey = this.getParentKey(node.id);
          }
        }
        return arr;
      },
      undo() {
        this.history.prev();
        if (this.history.active) {
          this.tree = cloneDeep(this.history.active.data);
          this.selected = this.pageNode;
          this.isChange = true;
        }
      },
      redo() {
        this.history.next();
        if (this.history.active) {
          this.tree = cloneDeep(this.history.active.data);
          this.selected = this.pageNode;
          this.isChange = true;
        }
      },
      cacheHistory() {
        if (this.isTriggerCache) {
          this.history.add(cloneDeep(this.tree));
        }
      },
      countAdd() {
        this.count += 1;
      },
      enableCache() {
        this.isTriggerCache = true;
      },
      disableCache() {
        this.isTriggerCache = false;
      },
    },
  })();
};
