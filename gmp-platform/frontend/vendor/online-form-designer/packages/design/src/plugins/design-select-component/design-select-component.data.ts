import { IDesignNodeData } from '@gct/base';
import { DesignNodeType } from '../../constant';
import { DesignContainerNode } from '../../data';

/**
 * 选择组件数据
 *
 * @author zhanghanrui
 * @date 2024-07-12 11:07:35
 * @export
 * @interface IDesignSelectComponentNodeData
 * @extends {IDesignNodeData}
 */
export interface IDesignSelectComponentNodeData extends IDesignNodeData {
  /**
   * 标题
   * @author lingxiaoming
   * @date 2024-07-19 03:37:47
   * @type {string}
   */
  title?: string | object;

  /**
   * 切换样式
   *
   * @author lingxiaoming
   * @date 2024-07-19 03:39:18
   * @type {('simple' | 'standard')}
   */
  switchStyle: 'simple' | 'standard';

  /**
   * 取值字段
   * 格式(模型key.字段key)
   * @author lingxiaoming
   * @date 2024-07-19 03:39:46
   * @type {string}
   */
  valueField?: string;

  /**
   * 选择的模型对象
   *
   * @author zhanghanrui
   * @date 2024-07-21 16:07:56
   * @type {string}
   */
  modelKey?: string;
}

/**
 * 设计选择组件节点
 *
 * @author zhanghanrui
 * @date 2024-07-12 13:07:43
 * @export
 * @class DesignSelectComponentNode
 * @extends {DesignContainerNode<IDesignSelectComponentNodeData>}
 */
export class DesignSelectComponentNode extends DesignContainerNode<IDesignSelectComponentNodeData> {
  override type: string = DesignNodeType.SELECT_COMPONENT;

  protected override createData(): IDesignSelectComponentNodeData {
    return {
      name: '选择组件',
      title: '选择组件',
      switchStyle: 'standard',
      valueField: undefined,
    };
  }
}
