/**
 * 链表节点
 *
 * @author zhanghanrui
 * @date 2024-07-31 15:07:21
 * @export
 * @class LinkedNode
 * @template T
 */
export class LinkedNode<T = any> {
  data: T;
  next: LinkedNode | null;
  prev: LinkedNode | null;

  /**
   * Creates an instance of LinkedNode.
   *
   * @author zhanghanrui
   * @date 2024-07-31 15:07:43
   * @param {T} data 当前节点数据
   * @param {(LinkedNode | null)} [next=null] 下一个节点
   * @param {(LinkedNode | null)} [prev=null] 上一个节点
   */
  constructor(data: T, next: LinkedNode | null = null, prev: LinkedNode | null = null) {
    this.data = data;
    this.next = next;
    this.prev = prev;
  }

  /**
   * 清理链表，避免内存泄漏
   *
   * @author zhanghanrui
   * @date 2024-07-31 15:07:34
   */
  clear(): void {
    this.data = null as T;
    this.next = null;
    this.prev = null;
  }
}
