import { IRelationshipDiagramLink, IRelationshipDiagramNode } from './interface';

/**
 * 界面状态
 *
 * @author zhanghanrui
 * @date 2024-06-25 10:06:07
 * @export
 * @class RelationshipDiagramConfigState
 */
export class RelationshipDiagramConfigState {
  /**
   * 是否已经初始化
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-06-25 10:06:08
   * @type {boolean}
   */
  initialized: boolean = false;

  /**
   * 当前已经准备完成节点数量
   *
   * @author zhanghanrui
   * @date 2024-06-25 14:06:14
   * @type {number}
   */
  nodeCount: number = 0;

  /**
   * 设计节点
   *
   * @author zhanghanrui
   * @date 2024-06-25 10:06:59
   * @type {IRelationshipDiagramNode[]}
   */
  nodes: IRelationshipDiagramNode[] = [];

  /**
   * 连线
   *
   * @author zhanghanrui
   * @date 2024-06-25 10:06:09
   * @type {IRelationshipDiagramLink[]}
   */
  links: IRelationshipDiagramLink[] = [];
}
