import { IDesignData, IDesignNode, IDesignTreeItem } from '@gct/base';
import { InsertNodeMode } from '../../constant';

/**
 * 界面状态操作
 *
 * @author zhanghanrui
 * @date 2024-07-05 13:07:58
 * @export
 * @interface IDesignViewActions
 */
export interface IDesignViewActions {
  /**
   * 获取结构树项
   *
   * @author zhanghanrui
   * @date 2024-08-21 14:08:51
   * @param {string} tag
   * @param {IDesignTreeItem[]} [items]
   * @return {*}  {IDesignTreeItem | null}
   */
  getTreeItem(tag: string, items?: IDesignTreeItem[]): IDesignTreeItem | null;

  /**
   * 获取指定结构树的子项
   *
   * @author zhanghanrui
   * @date 2024-08-23 10:08:55
   * @param {string} tag
   * @return {*}  {IDesignTreeItem[]}
   */
  getTreeItems(tag: string): IDesignTreeItem[];

  /**
   * 获取指定设计项的父
   *
   * @author zhanghanrui
   * @date 2024-08-23 15:08:50
   * @param {string} id
   * @param {(IDesignTreeItem | null)} parent 父一级节点
   * @param {IDesignTreeItem[]} [items]
   * @return {*}  {(string | null)} 为 null 时标识根一级节点
   */
  getParentKey(
    id: string,
    parent?: IDesignTreeItem | null,
    items?: IDesignTreeItem[],
  ): string | null;

  /**
   * 获取当前节点的子
   *
   * @author zhanghanrui
   * @date 2024-07-12 14:07:02
   * @param {(IDesignNode | string)} [node] 未指定时为获取根一层节点
   * @return {*}  {IDesignNode[]}
   */
  getChildren(node?: IDesignNode | string): IDesignNode[];

  /**
   * 激活页面配置
   *
   * @author zhanghanrui
   * @date 2024-07-24 13:07:31
   */
  activePage(): void;

  /**
   * 设置是否正在拖拽
   *
   * @param {boolean} bol
   */
  setDragging(bol: boolean): void;

  /**
   * 设置激活节点
   *
   * @author zhanghanrui
   * @date 2024-07-08 10:07:59
   * @param {(IDesignNode | null)} node
   */
  setActive(node: IDesignNode | null): void;

  /**
   * 设置设计界面节点，只支持设置根一层
   *
   * @author zhanghanrui
   * @date 2024-07-05 17:07:46
   * @param {IDesignNode[]} nodes
   */
  setNodes(nodes: IDesignNode[]): void;

  /**
   * 更新节点数据，不变更节点位置
   *
   * @author zhanghanrui
   * @date 2024-08-23 16:08:02
   * @param {IDesignNode} node
   */
  updateNode(node: IDesignNode): void;

  /**
   * 更新节点数据，并可以更新节点位置
   *
   * @description 节点不存在则创建，节点存在则更新，如果指定位置则更新至指定位置或新建至指定位置
   * @author zhanghanrui
   * @date 2024-07-05 18:07:35
   * @param {string | null} pKey
   * @param {IDesignNode} node
   * @param {number} [i]
   * @return {*}  {IDesignNode}
   */
  setNode(pKey: string | null, node: IDesignNode, i?: number): IDesignNode;

  /**
   * 设置结构树项
   *
   * @author zhanghanrui
   * @date 2024-08-21 18:08:05
   * @param {string} pKey 要放入的组标识
   * @param {string} id 要放入的节点标识
   * @param {number} [i] 要插入的位置，不指定时默认插入到最后
   */
  setTreeItem(pKey: string, id: string, i?: number): void;

  /**
   * 移动结构树项，若结构树上不存在原有节点，则在要移入的位置创建新的节点
   *
   * @author zhanghanrui
   * @date 2024-08-23 10:08:36
   * @param {string} oldPid 要移动的组标识
   * @param {string} newPid 要移入的组标识
   * @param {string} id 要移动的节点标识
   * @param {number} [i] 要插入的位置，不指定时默认插入到最后
   */
  moveTreeItem(oldPid: string, newPid: string, id: string, i?: number): void;

  /**
   * 获取节点信息
   *
   * @author zhanghanrui
   * @date 2024-07-06 13:07:51
   * @param {string} id
   * @return {*}  {(IDesignNode | null)}
   */
  getNode(id: string): IDesignNode | null;

  /**
   * 删除节点，只是从结构树上删除，不删除实际数据
   *
   * @author zhanghanrui
   * @date 2024-07-05 13:07:44
   * @param {(IDesignNode | string)} arg
   * @return {*}  {(IDesignNode | null)} 删除的节点
   */
  deleteNode(arg: IDesignNode | string): IDesignNode | null;

  /**
   * 插入节点
   *
   * @author zhanghanrui
   * @date 2024-07-08 14:07:12
   * @param {InsertNodeMode} mode 插入模式，竖向 or 横向
   * @param {IDesignNode} node 要插入到的前后的节点
   * @param {IDesignNode} data 要插入的节点
   * @return {*}  {boolean}
   */
  insertNode(mode: InsertNodeMode, node: IDesignNode, data: IDesignNode): boolean;

  /**
   * 设置设计 json
   *
   * @author zhanghanrui
   * @date 2024-07-11 17:07:58
   * @param {IDesignData} data
   */
  setData(data: IDesignData): void;

  /**
   * 获取设计 json 信息，nodes 会根据结构树过滤掉多余的信息
   *
   * @author zhanghanrui
   * @date 2024-07-11 17:07:18
   * @return {*}  {IDesignData}
   */
  getData(): IDesignData;

  /**
   * 根据指定节点 id，获取其在设计界面的层级路径
   *
   * @author zhanghanrui
   * @date 2024-07-12 10:07:02
   * @param {string} id
   * @return {*}  {IDesignNode[]}
   */
  getPaths(id: string): IDesignNode[];

  /**
   * 撤销
   *
   * @author zhanghanrui
   * @date 2024-07-31 17:07:20
   */
  undo(): void;

  /**
   * 重做
   *
   * @author zhanghanrui
   * @date 2024-07-31 17:07:25
   */
  redo(): void;

  /**
   * 缓存历史
   *
   * @author zhanghanrui
   * @date 2024-08-21 15:08:53
   */
  cacheHistory(): void;

  /**
   * 变更计数 +1
   *
   * @author zhanghanrui
   * @date 2024-08-15 16:08:50
   */
  countAdd(): void;

  /**
   * 启用缓存
   *
   * @author zhanghanrui
   * @date 2024-08-30 09:08:22
   */
  enableCache(): void;

  /**
   * 禁用缓存
   *
   * @author zhanghanrui
   * @date 2024-08-30 09:08:26
   */
  disableCache(): void;
}
