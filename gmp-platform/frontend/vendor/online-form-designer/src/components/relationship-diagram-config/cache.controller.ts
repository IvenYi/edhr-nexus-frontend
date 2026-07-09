import { cloneDeep } from 'lodash-es';
import { IRelationshipDiagramNode } from './interface';
import { RelationshipDiagramConfigController } from './relationship-diagram-config.controller';

/**
 * 所有的缓存操作，目前均会从
 *
 * @author zhanghanrui
 * @date 2024-06-30 11:06:52
 * @export
 * @class CacheController
 */
export class CacheController {
  /**
   * 正向节点的缓存
   *
   * @author zhanghanrui
   * @date 2024-06-30 11:06:15
   * @protected
   * @type {Map<string, IRelationshipDiagramNode[]>}
   */
  protected nodeCache: Map<string, IRelationshipDiagramNode[]> = new Map();

  /**
   * 反转节点的缓存
   *
   * @author zhanghanrui
   * @date 2024-06-30 11:06:28
   * @protected
   * @type {Map<string, IRelationshipDiagramNode[]>}
   */
  protected reverseNodeCache: Map<string, IRelationshipDiagramNode[]> = new Map();

  constructor(protected c: RelationshipDiagramConfigController) {}

  /**
   * 清空指定节点后的所有数据并进行备份
   *
   * @author zhanghanrui
   * @date 2024-06-30 12:06:00
   * @param {IRelationshipDiagramNode} node 正向节点，清空属性之前的数据
   * @return {*}  {boolean} 表示是否有后续节点被清空和缓存
   */
  clear(node: IRelationshipDiagramNode): boolean {
    const nextNode = this.c.node.get(node.id, 1);
    if (nextNode) {
      // 节点变更，缓存变更前所有后续节点
      const key = `${node.id}:${node.value}`;
      const i = this.c.node.getNodes().findIndex((n) => n.id === node.id);
      const nodes = this.c.state.nodes.slice(i + 1, this.c.state.nodes.length);
      if (nodes.length > 0) {
        this.nodeCache.set(key, cloneDeep(nodes));
        this.c.node.delete(nextNode.id);
        return true;
      }
    }
    return false;
  }

  /**
   * 根据指定节点恢复缓存的后续节点
   *
   * @author zhanghanrui
   * @date 2024-06-30 12:06:24
   * @param {IRelationshipDiagramNode} node 重新选择属性后的节点数据
   * @return {*}  {boolean} 有无数据恢复
   */
  reset(node: IRelationshipDiagramNode): boolean {
    if (node.value) {
      // 节点变更，缓存变更前所有后续节点
      const key = `${node.id}:${node.value}`;
      if (this.nodeCache.has(key)) {
        const nodes = this.nodeCache.get(key)!;
        if (nodes && nodes.length > 0) {
          this.c.node.setNodes([node, ...nodes], false);
          this.nodeCache.delete(key);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 清空指定节点后的所有数据并进行备份，备份包含节点和后续节点
   *
   * @author zhanghanrui
   * @date 2024-06-30 12:06:25
   * @param {IRelationshipDiagramNode} node 反向节点，修改前包含字段的节点
   * @param {string} [prefix='']
   * @return {*}  {boolean} 表示是否有后续节点被清空和缓存
   */
  reverseClear(node: IRelationshipDiagramNode, prefix: string = ''): boolean {
    const key = `${prefix}${node.id}${node.modelKey ? `:${node.modelKey}` : ''}`;
    const nextNode = this.c.node.get(node.id, 1);
    if (nextNode) {
      // 节点变更，缓存变更前所有后续节点
      const i = this.c.node.getNodes().findIndex((n) => n.id === node.id);
      const nodes = this.c.state.nodes.slice(i + 1, this.c.state.nodes.length);
      if (nodes.length > 0) {
        this.reverseNodeCache.set(key, [cloneDeep(node), ...cloneDeep(nodes)]);
        this.c.node.delete(nextNode.id);
        return true;
      }
    } else {
      // 没有后续节点，只缓存自身
      if (node.modelKey && node.value) {
        this.reverseNodeCache.set(key, [cloneDeep(node)]);
      }
    }
    return false;
  }

  /**
   * 回填反向节点的缓存
   *
   * @author zhanghanrui
   * @date 2024-06-30 12:06:20
   * @param {IRelationshipDiagramNode} node 修改后带字段的反向节点
   * @param {string} [prefix='']
   * @return {*}  {boolean} 是否后后续节点恢复
   */
  reverseReset(node: IRelationshipDiagramNode, prefix: string = ''): boolean {
    // 节点变更，缓存变更前所有后续节点
    const key = `${prefix}${node.id}${node.modelKey ? `:${node.modelKey}` : ''}`;
    if (this.reverseNodeCache.has(key)) {
      const nodes = cloneDeep(this.reverseNodeCache.get(key)!);
      if (nodes.length > 0) {
        const first = nodes[0];
        if (first.modelKey !== node.modelKey) {
          return false;
        }
        this.c.node.update(first);
        this.c.node.setNodes(nodes, false);
        this.reverseNodeCache.delete(key);
        return true;
      }
    }
    return false;
  }
}
