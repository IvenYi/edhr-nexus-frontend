import { FIELD_TYPE, IEditForm } from '@gct/runtime';
import { IDesignEditorNode } from '@gct/base';
import { DesignNodeMode, DesignNodeType, MaterialGroup } from '../../constant';
import { IMaterialData, INodeProvider } from '../../interface';
import { NodeBaseProvider } from '../../provider';
import { DesignEditorNode } from '../../data';

/**
 * 设计编辑器节点提供者
 *
 * @author chitanda
 * @date 2025-07-07 15:07:08
 * @export
 * @abstract
 * @class DesignEditorNodeProvider
 * @extends {NodeBaseProvider<IDesignEditorNode>}
 * @implements {INodeProvider<IDesignEditorNode>}
 */
export abstract class DesignEditorNodeProvider
  extends NodeBaseProvider<IDesignEditorNode>
  implements INodeProvider<IDesignEditorNode>
{
  mode = DesignNodeMode.ITEM;

  type: string = DesignNodeType.DESIGN_EDITOR;

  /**
   * 字段键名（用于预置字段的特殊匹配，例如主键的字段类型是文本，只能用字段的标识 id_ 匹配）
   *
   * @author chitanda
   * @date 2025-07-07 15:07:45
   * @abstract
   * @type {string}
   */
  fieldKey?: string;

  /**
   * 字段类型
   *
   * @author chitanda
   * @date 2025-07-07 15:07:54
   * @abstract
   * @type {FIELD_TYPE}
   */
  fieldType?: FIELD_TYPE;

  static materialConfig: IMaterialData = {
    group: MaterialGroup.SYSTEM,
    label: '菜单列表',
    type: DesignNodeType.MENU_LIST,
    icon: 'icon-kapianliebiao',
    order: 0,
  };

  model: IEditForm = {
    type: 'edit',
    children: [],
  };

  create(data?: IDesignEditorNode): IDesignEditorNode {
    return new DesignEditorNode(data);
  }
}
