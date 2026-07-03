import { DesignContainerNode, DesignNodeType } from '@gct/runtime-design';
import {
  CARD_LABEL_WIDTH_MODE,
  CARD_LABEL_WRAP_MODE,
  CARD_LAYOUT_MODE,
  CARD_SIZE_TYPE,
} from '../../enum';
import { ICardDesignPageNodeData } from '../../interface';

/**
 * 设计选项卡节点
 *
 * @export
 * @class DesignTabsNode
 * @extends {DesignContainerNode<ICardDesignPageNodeData>}
 */
export class DesignPageNode extends DesignContainerNode<ICardDesignPageNodeData> {
  override type: string = DesignNodeType.PAGE_LOWER;

  protected override createData(): ICardDesignPageNodeData {
    return {
      size_mode: CARD_SIZE_TYPE.CUSTOM,
      width: 480,
      border_radius: 4,
      layout_mode: CARD_LAYOUT_MODE.HORIZONTAL,
      custom_label_width: false,
      label_mode: CARD_LABEL_WIDTH_MODE.PERCENT,
      label_width: 30,
      wrap_mode: CARD_LABEL_WRAP_MODE.WRAP,
      spacing: [{}, { top: '16px', right: '16px', bottom: '16px', left: '16px' }],
      background: '',
      colspan: 24,
    };
  }
}
