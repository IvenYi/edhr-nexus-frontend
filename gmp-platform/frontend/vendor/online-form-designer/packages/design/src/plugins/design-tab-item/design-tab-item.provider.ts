import {
  EditorType,
  IEditForm,
  IFormCollapse,
  IFormEditItem,
  IFormItem,
  IFormTab,
  IFormTabPane,
} from '@gct/runtime';
import {
  DesignEditorType,
  DesignItemActionTag,
  DesignNodeMode,
  DesignNodeType,
  MaterialGroup,
} from '../../constant';
import { IDesignItemAction, IMaterialData, INodeProvider, IStyleSpacing } from '../../interface';
import { DesignTabItemNode } from './design-tab-item.data';
import { NodeBaseProvider } from '../../provider';

/**
 * 选项卡子项
 *
 * @author zhanghanrui
 * @date 2024-07-16 17:07:10
 * @export
 * @class DesignTabItemProvider
 * @extends {NodeBaseProvider<DesignTabItemNode>}
 * @implements {INodeProvider<DesignTabItemNode>}
 */
export class DesignTabItemProvider
  extends NodeBaseProvider<DesignTabItemNode>
  implements INodeProvider<DesignTabItemNode>
{
  mode = DesignNodeMode.CONTAINER;

  type: string = DesignNodeType.TAB_ITEM;

  component = 'DesignTabItemComponent';

  override isDrag: boolean = false;

  static materialConfig: IMaterialData = {
    group: MaterialGroup.LAYOUT,
    label: '选项卡子项',
    type: DesignNodeType.TAB_ITEM,
    icon: 'icon-a-gudingbiaosvg',
    order: 0,
  };

  model: IEditForm = {
    type: 'edit',
    children: [
      {
        type: 'tab',
        name: 'tab',
        isContainer: true,
        layout: 'flex',
        navPosition: 'center',
        height: '100%',
        children: [
          {
            name: 'pane1',
            type: 'tab-pane',
            isContainer: true,
            title: window.$t('sys.designView.form.attribute'),
            layout: 'grid',
            children: [
              {
                name: 'collapse-property',
                type: 'collapse',
                isContainer: true,
                layout: 'flex',
                children: [
                  {
                    name: 'collapse-pane-config',
                    type: 'collapse-pane',
                    isContainer: true,
                    layout: 'grid',
                    title: window.$t('sys.designView.form.baseAttribute'),
                    children: [
                      {
                        type: 'hidden',
                        name: 'i18nConfig',
                      },
                      {
                        type: 'item',
                        label: window.$t('sys.designView.components.tabItem.form.label'),
                        labelPosition: 'top',
                        name: 'title',
                        editor: {
                          type: EditorType.I18N,
                          props: {
                            size: 'small',
                            attr: 'title',
                          },
                        },
                      },
                    ] as IFormEditItem[],
                  },
                ],
              },
            ],
          },
          {
            name: 'pane2',
            type: 'tab-pane',
            class: 'style-pane',
            title: window.$t('sys.designView.form.style'),
            isContainer: true,
            layout: 'grid',
            children: [
              {
                name: 'collapse-style',
                type: 'collapse',
                isContainer: true,
                layout: 'flex',
                children: [
                  {
                    name: 'collapse-pane-layout',
                    type: 'collapse-pane',
                    isContainer: true,
                    layout: 'grid',
                    title: window.$t('sys.designView.form.layout'),
                    children: [
                      {
                        type: 'item',
                        label: '宽度',
                        name: 'width',
                        noColon: true,
                        labelAlign: 'left',
                        labelWidth: '34px',
                        editor: {
                          type: EditorType.LENGTH_UNIT,
                        },
                      },
                      {
                        type: 'item',
                        label: '高度',
                        name: 'height',
                        noColon: true,
                        labelAlign: 'left',
                        labelWidth: '34px',
                        editor: {
                          type: EditorType.LENGTH_UNIT,
                        },
                      },
                    ] as IFormItem[],
                  },
                  {
                    name: 'collapse-pane-bg',
                    type: 'collapse-pane',
                    isContainer: true,
                    layout: 'grid',
                    title: window.$t('sys.designView.form.background'),
                    children: [
                      {
                        type: 'item',
                        label: window.$t('sys.designView.form.backgroundColor'),
                        name: 'background',
                        noColon: true,
                        labelAlign: 'left',
                        labelWidth: '56px',
                        editor: {
                          type: EditorType.COLOR,
                        },
                      } as IFormItem,
                    ] as IFormItem[],
                  },
                  {
                    name: 'collapse-pane-spacing',
                    type: 'collapse-pane',
                    isContainer: true,
                    layout: 'grid',
                    title: window.$t('sys.designView.form.margin'),
                    children: [
                      {
                        type: 'hidden',
                        name: 'padding',
                      },
                      {
                        type: 'item',
                        name: 'margin',
                        fields: ['margin', 'padding'],
                        editor: {
                          type: DesignEditorType.STYLE_SPACING,
                          showArea: ['padding'],
                        } as IStyleSpacing,
                      } as IFormItem,
                    ] as IFormItem[],
                  },
                ],
              } as IFormCollapse,
            ],
          },
        ] as IFormTabPane[],
      } as IFormTab,
    ],
  };

  protected override createActions(): IDesignItemAction[] {
    return [
      {
        tag: DesignItemActionTag.SELECT_PARENT,
        icon: 'icon-fuzujian',
        tooltip: window.$t('sys.designView.tips.selectParent'),
      },
    ];
  }

  create(data?: DesignTabItemNode): DesignTabItemNode {
    return new DesignTabItemNode(data);
  }
}
