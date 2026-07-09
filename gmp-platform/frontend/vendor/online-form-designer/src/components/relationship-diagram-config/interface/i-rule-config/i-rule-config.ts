import { IRelationshipDiagramNode } from '../i-relationship-diagram-node/i-relationship-diagram-node';

/**
 * 设计 json
 *
 * @author zhanghanrui
 * @date 2024-06-29 17:06:51
 * @export
 * @interface IDesignJson
 */
export interface IDesignJson {
  /**
   * 前置信息
   *
   * @author zhanghanrui
   * @date 2024-06-29 17:06:58
   * @type {IData}
   */
  before?: IData;
  /**
   * 节点信息
   *
   * @author zhanghanrui
   * @date 2024-06-29 17:06:10
   * @type {IRelationshipDiagramNode[]}
   */
  nodes: IRelationshipDiagramNode[];
  /**
   * 后置信息
   *
   * @author zhanghanrui
   * @date 2024-06-29 17:06:08
   * @type {IData}
   */
  after?: IData;
}

export interface INodeData {
  /**
   * 模型标识
   *
   * @author zhanghanrui
   * @date 2024-06-29 17:06:38
   * @type {string}
   */
  modelKey: string;
  /**
   * 模型类型
   *
   * @author zhanghanrui
   * @date 2024-06-29 17:06:06
   * @type {string}
   */
  modelCategory: string;
  /**
   * 属性标识
   *
   * @author zhanghanrui
   * @date 2024-06-29 17:06:42
   * @type {string}
   */
  fieldKey: string;
  /**
   * 节点方向
   *
   * @author zhanghanrui
   * @date 2024-06-29 17:06:47
   * @type {('forward' | 'backward' | '')}
   */
  direction: 'forward' | 'backward' | '';
}

/**
 * 数据联动 ruleConfig 配置清单
 *
 * @author zhanghanrui
 * @date 2024-06-29 17:06:29
 * @export
 * @interface IRuleConfig
 */
export interface IRuleConfig {
  /**
   * 设计 json 配置
   *
   * @author zhanghanrui
   * @date 2024-06-29 17:06:31
   * @type {IDesignJson}
   */
  designJson: IDesignJson;
  /**
   * 是否强依赖
   *
   * @author zhanghanrui
   * @date 2024-09-02 15:09:15
   * @type {boolean}
   */
  strongDependence: boolean;
  /**
   * 主查字段名称
   *
   * @author zhanghanrui
   * @date 2024-06-29 19:06:48
   * @type {string}
   */
  modelKey: string;
  /**
   * 属性标识（不是所有场景都有）
   *
   * @author zhanghanrui
   * @date 2024-07-05 11:07:25
   * @type {string}
   */
  fieldId?: string;
  /**
   * 属性标识（不是所有场景都有）
   *
   * @author zhanghanrui
   * @date 2024-06-29 17:06:47
   * @type {string}
   */
  fieldKey?: string;
  /**
   * 属性名称
   *
   * @author zhanghanrui
   * @date 2024-06-29 19:06:24
   * @type {string}
   */
  fieldLabel?: string;
  /**
   * 给后台使用的 nodes 清单
   *
   * @author zhanghanrui
   * @date 2024-06-29 17:06:41
   * @type {INodeData[]}
   */
  nodes: INodeData[];
}
