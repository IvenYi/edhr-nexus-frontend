import { clone, uuid } from '@jsplumb/browser-ui';
import { IRelationshipDiagramNode } from './interface';
import { RelationshipDiagramConfigController } from './relationship-diagram-config.controller';
import { LinkType, NodeType } from './constant';
import { CacheController } from './cache.controller';

/**
 * 节点控制器
 *
 * @author zhanghanrui
 * @date 2024-06-25 14:06:28
 * @export
 * @class NodeController
 */
export class NodeController {
  /**
   * 节点切换缓存
   *
   * @author zhanghanrui
   * @date 2024-06-30 12:06:00
   * @type {CacheController}
   */
  readonly cache: CacheController;

  constructor(protected readonly c: RelationshipDiagramConfigController) {
    this.cache = new CacheController(c);
  }

  /**
   * 创建节点
   *
   * @author zhanghanrui
   * @date 2024-06-28 15:06:36
   * @param {IData} data
   * @param {IData} [link={}] 创建节点时会同步创建连线
   * @return {*}  {(IRelationshipDiagramNode | null)}
   */
  create(data: IData, link: IData = {}): IRelationshipDiagramNode | null {
    if (this.c.config.max != null && this.c.config.max <= this.c.state.nodes.length) {
      console.warn('节点数量已达到最大值');
      return null;
    }
    if (this.c.config.reverseMax != null) {
      const reverseNodes = this.c.state.nodes.filter((node) => node.type === NodeType.REVERSE);
      if (reverseNodes.length >= this.c.config.reverseMax) {
        console.warn('反向节点数量已达到最大值');
        return null;
      }
    }
    const node: IRelationshipDiagramNode = {
      id: uuid(),
      type: NodeType.DEFAULT,
      noSelectField: false,
      reverse: false,
      ...(data as any),
    };
    const beforeNode = this.c.state.nodes[this.c.state.nodes.length - 1];
    this.c.state.nodes.push(node);
    setTimeout(() => {
      this.c.link.create({
        source: link.reverse ? node.id : beforeNode.id,
        target: link.reverse ? beforeNode.id : node.id,
        ...link,
      });
    }, 0);
    return node;
  }

  /**
   * 更新节点信息
   *
   * @author zhanghanrui
   * @date 2024-06-29 15:06:40
   * @param {IRelationshipDiagramNode} node
   * @return {*}  {void}
   */
  update(node: IRelationshipDiagramNode): void {
    const data = this.get(node.id, 0, false);
    if (data) {
      this.set(Object.assign(data, node));
    }
  }

  /**
   * 获取节点数据
   *
   * @author zhanghanrui
   * @date 2024-06-28 13:06:48
   * @param {string} id
   * @param {number} [offset=0]
   * @param {boolean} [isClone=true]
   * @return {*}  {(IRelationshipDiagramNode | null)}
   */
  get(id: string, offset: number = 0, isClone: boolean = true): IRelationshipDiagramNode | null {
    const i = this.c.state.nodes.findIndex((node) => node.id === id);
    if (i !== -1 && this.c.state.nodes.length > i + offset) {
      if (isClone) {
        return clone(this.c.state.nodes[i + offset]);
      }
      return this.c.state.nodes[i + offset];
    }
    return null;
  }

  /**
   * 设置值，重新赋值一下，避免无法触发界面重绘
   *
   * @author zhanghanrui
   * @date 2024-06-27 19:06:31
   * @param {IRelationshipDiagramNode} node
   */
  set(node: IRelationshipDiagramNode): void {
    const i = this.c.state.nodes.findIndex((_) => _.id === node.id);
    if (i !== -1) {
      this.c.state.nodes[i] = node;
      // eslint-disable-next-line no-self-assign
      this.c.state.nodes = this.c.state.nodes;
    }
  }

  /**
   * 删除节点数据，会删除节点以及之后所有的节点数据
   *
   * @author zhanghanrui
   * @date 2024-06-28 13:06:06
   * @param {string} id
   * @param {boolean} [deleteLine=true] 默认同时删除连线
   */
  delete(id: string, deleteLine: boolean = true): void {
    const i = this.c.state.nodes.findIndex((node) => node.id === id);
    if (i !== -1) {
      this.c.state.nodes.splice(i, this.c.state.nodes.length);
      if (deleteLine) {
        const deleteLink = this.c.link.getBySource(id);
        if (deleteLink) {
          this.c.link.delete(deleteLink.id);
        }
        const deleteReverseLink = this.c.link.getByTarget(id);
        if (deleteReverseLink) {
          this.c.link.delete(deleteReverseLink.id);
        }
      }
    }
  }

  /**
   * 节点绘制完毕
   *
   * @author zhanghanrui
   * @date 2024-06-25 14:06:08
   * @param {string} _id
   */
  mounted(_id: string): void {
    this.c.state.nodeCount++;
  }

  /**
   * 节点销毁
   *
   * @author zhanghanrui
   * @date 2024-06-25 14:06:16
   * @param {string} _id
   */
  unmounted(_id: string): void {
    this.c.state.nodeCount--;
  }

  /**
   * 设置节点
   *
   * @author zhanghanrui
   * @date 2024-06-29 16:06:58
   * @param {IRelationshipDiagramNode[]} nodes
   */
  setNodes(nodes: IRelationshipDiagramNode[], isSetFirst: boolean = true): void {
    if (nodes.length > 0) {
      if (isSetFirst) {
        this.c.state.nodes.push(...nodes);
      }
      let before = nodes.shift()!;
      if (!isSetFirst) {
        this.c.state.nodes.push(...nodes);
      }
      nodes.forEach((_) => {
        if (_.reverse) {
          this.c.link.create({
            source: _.id,
            target: before.id,
            reverse: true,
            type: _.value ? LinkType.DEFAULT : LinkType.VIRTUAL,
          });
        } else {
          this.c.link.create({
            source: before.id,
            target: _.id,
          });
        }
        before = _;
      });
    }
  }

  /**
   * 当前所有节点引用
   *
   * @author zhanghanrui
   * @date 2024-06-30 12:06:41
   * @return {*}  {IRelationshipDiagramNode[]}
   */
  getNodes(): IRelationshipDiagramNode[] {
    return this.c.state.nodes;
  }
}
