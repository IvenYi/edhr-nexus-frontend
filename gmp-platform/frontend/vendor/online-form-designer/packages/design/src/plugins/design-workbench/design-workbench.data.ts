import { useI18n } from '/@/hooks/web/useI18n';
import { IDesignNodeData } from '@gct/base';
import { DesignNodeType } from '../../constant';
import { DesignContainerNode } from '../../data';
import { WorkbenchType } from '@gct/runtime';

const { t } = useI18n();

/**
 * 标签页数据
 *
 * @author zhanghanrui
 * @date 2024-07-29 16:07:12
 * @export
 * @interface IDesignTabsData
 * @extends {IDesignNodeData}
 */
export interface IDesignWorkbenchData extends IDesignNodeData {
  displayContent: (string | object)[];
}
/**
 * 设计选项卡节点
 *
 * @author zhanghanrui
 * @date 2024-07-12 13:07:43
 * @export
 * @class DesignTabsNode
 * @extends {DesignContainerNode<IDesignNodeData>}
 */
export class DesignWorkbenchNode extends DesignContainerNode<IDesignNodeData> {
  override type: string = DesignNodeType.WORKBENCH;

  protected override createData(): IDesignWorkbenchData {
    return {
      name: '工作台',
      // displayContent: [WorkbenchType.TEST, WorkbenchType.QUICK, WorkbenchType.MY],
      displayContent: [
        {
          value: WorkbenchType.TEST,
          checked: true,
        },
        {
          value: WorkbenchType.QUICK,
          checked: true,
        },
        {
          value: WorkbenchType.MY,
          checked: true,
        },
      ],
      options: [],
      padding: {
        top: 0,
        left: '12px',
        right: '12px',
        bottom: 0,
      },
    };
  }
}
