import { BindCmpStyleEnum, CURRENCY_ENUM, TagTypeEnum, TIMETYPE_ENUM } from '@gct/runtime';
import { DesignContainerNode, DesignNodeType, IModelFieldNodeData } from '@gct/runtime-design';

/**
 * 设计选项卡节点
 *
 * @export
 * @class CardFieldDesignNode
 * @extends {DesignContainerNode<IModelFieldNodeData>}
 */
export class CardFieldDesignNode extends DesignContainerNode<IModelFieldNodeData> {
  override type: string = DesignNodeType.FIELD;

  override get label(): string {
    return this.data.label || this.data.name;
  }

  protected override createData(): IModelFieldNodeData {
    return {
      modelKey: '',
      modelCategory: '',
      key: '',
      type: '',
      label: '',
      name: '',
      separator: '-',
      show_label: true,
      editor_type: BindCmpStyleEnum.CMP_NUMBER,
      currency: CURRENCY_ENUM['￥'],
      time_type: TIMETYPE_ENUM['d:h:m:s'],
      tag_style: {
        check: false,
        mode: TagTypeEnum.RADIUS,
        color: '',
      },
    };
  }
}
