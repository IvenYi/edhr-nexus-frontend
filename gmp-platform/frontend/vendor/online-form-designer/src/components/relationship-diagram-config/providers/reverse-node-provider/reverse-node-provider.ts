import { NodeType } from '../../constant';
import { INodeProvider } from '../../interface';

/**
 * 最后的虚拟节点
 *
 * @author zhanghanrui
 * @date 2024-06-25 20:06:31
 * @export
 * @class ReverseNodeProvider
 * @implements {INodeProvider}
 */
export class ReverseNodeProvider implements INodeProvider {
  type: string = NodeType.REVERSE;

  component: string = 'DiagramConfigItemReverse';
}
