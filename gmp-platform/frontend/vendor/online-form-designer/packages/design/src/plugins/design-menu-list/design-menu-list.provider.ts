import { ICheckSwitchEditor } from './../../../../runtime/src/interface/form/i-editor/i-check-switch';
import {
  EditorType,
  IEditForm,
  IFormCollapse,
  IFormContainer,
  IFormItem,
  IFormTab,
  IFormTabPane,
  INumberEditor,
  IRadioEditor,
} from '@gct/runtime';
import { DesignEditorType, DesignNodeMode, DesignNodeType, MaterialGroup } from '../../constant';
import { IMaterialData, INodeProvider, IStyleSpacing } from '../../interface';
import { DesignMenuListNode } from './design-menu-list.data';
import { NodeBaseProvider } from '../../provider';

enum ListStyle {
  UPDT = 'vertical',
  LPRT = 'horizontal',
}

const ListStyleMap = {
  [ListStyle.UPDT]: '上图下文',
  [ListStyle.LPRT]: '左图右文',
};

enum TitleOverflow {
  HIDDEN = 'hidden',
  WRAP = 'wrap',
}

const TitleOverflowMap = {
  [TitleOverflow.HIDDEN]: '截取',
  [TitleOverflow.WRAP]: '换行',
};

/**
 * 菜单列表
 *
 * @author zhanghanrui
 * @date 2024-07-16 17:07:10
 * @export
 * @class DesignMenuListProvider
 * @extends {NodeBaseProvider<DesignMenuListNode>}
 * @implements {INodeProvider<DesignMenuListNode>}
 */
export class DesignMenuListProvider
  extends NodeBaseProvider<DesignMenuListNode>
  implements INodeProvider<DesignMenuListNode>
{
  mode = DesignNodeMode.ITEM;

  type: string = DesignNodeType.MENU_LIST;

  component = 'DesignMenuListComponent';

  static materialConfig: IMaterialData = {
    group: MaterialGroup.SYSTEM,
    label: '菜单列表',
    type: DesignNodeType.MENU_LIST,
    icon: 'icon-kapianliebiao',
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
                    title: window.$t('sys.appDesigner.designView.components.menuList.form.group'),
                    children: [
                      {
                        type: 'item',
                        name: 'empty',
                        label: window.$t(
                          'sys.appDesigner.designView.components.menuList.form.label',
                        ),
                        style: 'margin-bottom: 0;',
                        labelAlign: 'left',
                        noColon: true,
                        editor: {
                          type: EditorType.INFO,
                        },
                      } as IFormItem,
                      {
                        type: 'item',
                        name: 'enableSearch',
                        label: window.$t(
                          'sys.appDesigner.designView.components.menuList.form.label2',
                        ),
                        labelAlign: 'left',
                        editorAlign: 'right',
                        noColon: true,
                        defaultValue: true,
                        style: '--gct-form-item-label-color: #8F8F8F;',
                        editor: {
                          type: EditorType.CHECK_SWITCH,
                          isSwitch: true,
                          props: {
                            size: 'small',
                          },
                        } as ICheckSwitchEditor,
                      } as IFormItem,
                      {
                        type: 'item',
                        name: 'mode',
                        label: window.$t(
                          'sys.appDesigner.designView.components.menuList.form.label3',
                        ),
                        labelPosition: 'top',
                        labelAlign: 'left',
                        noColon: true,
                        defaultValue: ListStyle.UPDT,
                        dictionary: {
                          tag: 'listStyle',
                          mode: 'static',
                          items: Object.keys(ListStyleMap).map((key) => {
                            return { value: key, label: ListStyleMap[key] };
                          }),
                        },
                        editor: {
                          type: EditorType.RADIO,
                          buttonMode: true,
                          props: {
                            size: 'small',
                          },
                        } as IRadioEditor,
                      },
                      {
                        type: 'item',
                        name: 'titleOverflow',
                        label: window.$t(
                          'sys.appDesigner.designView.components.menuList.form.label4',
                        ),
                        labelPosition: 'top',
                        labelAlign: 'left',
                        noColon: true,
                        labelWidth: '150px',
                        defaultValue: TitleOverflow.HIDDEN,
                        dictionary: {
                          tag: 'titleOverflow',
                          mode: 'static',
                          items: Object.keys(TitleOverflowMap).map((key) => {
                            return { value: key, label: TitleOverflowMap[key] };
                          }),
                        },
                        editor: {
                          type: EditorType.RADIO,
                          buttonMode: true,
                          props: {
                            size: 'small',
                          },
                        } as IRadioEditor,
                      },
                      {
                        type: 'item',
                        name: 'empty',
                        label: window.$t(
                          'sys.appDesigner.designView.components.menuList.form.label5',
                        ),
                        style: 'margin-bottom: 0;',
                        labelAlign: 'left',
                        noColon: true,
                        editor: {
                          type: EditorType.INFO,
                        },
                      } as IFormItem,
                      {
                        type: 'item',
                        name: 'enabledRange',
                        label: window.$t(
                          'sys.appDesigner.designView.components.menuList.form.label6',
                        ),
                        labelAlign: 'left',
                        editorAlign: 'right',
                        labelWidth: '150px',
                        noColon: true,
                        defaultValue: true,
                        style: '--gct-form-item-label-color: #8F8F8F;',
                        editor: {
                          type: EditorType.CHECK_SWITCH,
                          isSwitch: true,
                          props: {
                            size: 'small',
                          },
                        } as ICheckSwitchEditor,
                      } as IFormItem,
                      {
                        type: 'container',
                        layout: 'grid',
                        name: 'container1',
                        children: [
                          {
                            type: 'item',
                            name: 'rowNum',
                            gridItem: {
                              span: 12,
                            },
                            editor: {
                              type: EditorType.NUMBER,
                              addonAfter: window.$t('sys.row'),
                              class: 'suffix-number-input',
                              min: 1,
                              max: 10,
                            } as INumberEditor,
                          },
                          {
                            type: 'item',
                            name: 'colNum',
                            gridItem: {
                              span: 12,
                            },
                            editor: {
                              type: EditorType.NUMBER,
                              addonAfter: window.$t('sys.col'),
                              class: 'suffix-number-input',
                              min: 1,
                              max: 5,
                            } as INumberEditor,
                          },
                        ] as IFormItem[],
                      } as IFormContainer,
                    ] as IFormItem[],
                  },
                ],
              } as IFormCollapse,
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

  create(data?: DesignMenuListNode): DesignMenuListNode {
    return new DesignMenuListNode(data);
  }
}
