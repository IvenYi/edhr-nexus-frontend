import { NodeType } from '../../constant';
import { INodeProvider } from '../../interface';

/**
 * 默认节点
 *
 * @author zhanghanrui
 * @date 2024-06-25 20:06:31
 * @export
 * @class DefaultNodeProvider
 * @implements {INodeProvider}
 */
export class DefaultNodeProvider implements INodeProvider {
  type: string = NodeType.DEFAULT;

  component: string = 'DiagramConfigItem';
}
