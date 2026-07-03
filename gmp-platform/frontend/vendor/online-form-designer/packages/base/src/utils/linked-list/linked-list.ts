import { LinkedNode } from '../linked-node/linked-node';

/**
 * 链表列表
 *
 * @author zhanghanrui
 * @date 2024-07-31 15:07:37
 * @export
 * @class LinkedList
 */
export class LinkedList<T = any> {
  /**
   * 当前激活节点
   *
   * @author zhanghanrui
   * @date 2024-07-31 15:07:02
   * @type {(LinkedNode<T> | null)}
   */
  active: LinkedNode<T> | null = null;

  /**
   * 新增节点
   *
   * @author zhanghanrui
   * @date 2024-07-31 15:07:45
   * @param {T} data
   */
  add(data: T): void {
    // 无节点时实例化初始节点
    if (!this.active) {
      this.active = new LinkedNode(data);
    } else {
      // 新增链表节点时，如果激活节点有则清理后续所有节点重新设置
      if (this.active.next) {
        let next: LinkedNode<any> | null = this.active.next;
        while (next) {
          next = next.next;
          if (next) {
            next.clear();
          }
        }
      }
      const node = new LinkedNode(data, null, this.active);
      this.active.next = node;
      this.active = node;
    }
  }

  /**
   * 删除节点
   *
   * @author zhanghanrui
   * @date 2024-07-31 15:07:11
   * @param {LinkedNode<T>} node
   */
  delete(node: LinkedNode<T>): void {
    // 将节点前后节点连接
    const { prev, next } = node;
    if (prev) {
      prev.next = next;
    }
    if (next) {
      next.prev = prev;
    }
    node.clear();
  }

  /**
   * 上一个节点
   *
   * @author zhanghanrui
   * @date 2024-07-31 16:07:41
   */
  prev(): void {
    if (this.active && this.active.prev) {
      this.active = this.active.prev;
    }
  }

  /**
   * 下一个节点
   *
   * @author zhanghanrui
   * @date 2024-07-31 16:07:57
   */
  next(): void {
    if (this.active && this.active.next) {
      this.active = this.active.next;
    }
  }

  /**
   * 清理所有缓存
   *
   * @author zhanghanrui
   * @date 2024-07-31 16:07:43
   */
  clearAll(): void {
    if (this.active) {
      let prev: LinkedNode<T> | null = this.active.prev;
      let next: LinkedNode<T> | null = this.active.next;
      while (prev) {
        prev.clear();
        prev = prev.prev;
      }
      while (next) {
        next.clear();
        next = next.next;
      }
      this.active.clear();
    }
  }

  /**
   * 是否可以撤销
   *
   * @author zhanghanrui
   * @date 2024-08-21 15:08:57
   * @return {*}  {boolean}
   */
  canUndo(): boolean {
    return !!this.active && !!this.active.prev;
  }

  /**
   * 是否可以重做
   *
   * @author zhanghanrui
   * @date 2024-08-21 15:08:33
   * @return {*}  {boolean}
   */
  canRedo(): boolean {
    return !!this.active && !!this.active.next;
  }
}
