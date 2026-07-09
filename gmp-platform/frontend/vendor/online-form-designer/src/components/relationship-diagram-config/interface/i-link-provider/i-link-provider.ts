import { ConnectParams } from '@jsplumb/browser-ui';
import { IRelationshipDiagramLink } from '../i-relationship-diagram-link/i-relationship-diagram-link';
import { RelationshipDiagramConfigController } from '../../relationship-diagram-config.controller';

/**
 * 连线适配器
 *
 * @author zhanghanrui
 * @date 2024-06-25 19:06:57
 * @export
 * @interface ILinkProvider
 */
export interface ILinkProvider {
  /**
   * 连线类型
   *
   * @author zhanghanrui
   * @date 2024-06-25 20:06:56
   * @type {string}
   */
  type: string;

  /**
   * 连线起始元素，填写 class name
   *
   * @author zhanghanrui
   * @date 2024-06-25 19:06:54
   * @type {string}
   */
  sourceHandle?: string;

  /**
   * 连线结束元素，填写 class name
   *
   * @author zhanghanrui
   * @date 2024-06-25 19:06:15
   * @type {string}
   */
  targetHandle?: string;

  /**
   * 计算连线配置
   *
   * @author zhanghanrui
   * @date 2024-06-26 10:06:44
   * @param {RelationshipDiagramConfigController} c
   * @param {number} i
   * @param {IRelationshipDiagramLink} link
   * @return {*}  {ConnectParams<Element>}
   */
  options(
    c: RelationshipDiagramConfigController,
    link: IRelationshipDiagramLink,
  ): ConnectParams<Element>;

  /**
   * 连线点击事件
   *
   * @author zhanghanrui
   * @date 2024-08-08 17:08:02
   * @param {RelationshipDiagramConfigController} c
   * @param {IRelationshipDiagramLink} link
   */
  click?(c: RelationshipDiagramConfigController, link: IRelationshipDiagramLink): void;
}
