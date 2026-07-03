import {
  EditorType,
  IEditForm,
  IFormCollapse,
  IFormItem,
  IFormTab,
  IFormTabPane,
} from '@gct/runtime';
import { DesignEditorType, DesignNodeMode, DesignNodeType, MaterialGroup } from '../../constant';
import {
  IMaterialData,
  INodeProvider,
  IStyleBorder,
  IStyleFont,
  IStyleSpacing,
} from '../../interface';
import { DesignPanelNode } from './design-panel.data';
import { NodeBaseProvider } from '../../provider';

/**
 * 面板
 *
 * @author zhanghanrui
 * @date 2024-07-16 17:07:36
 * @export
 * @class DesignPanelProvider
 * @extends {NodeBaseProvider<DesignPanelNode>}
 * @implements {INodeProvider<DesignPanelNode>}
 */
export class DesignPanelProvider
  extends NodeBaseProvider<DesignPanelNode>
  implements INodeProvider<DesignPanelNode>
{
  mode = DesignNodeMode.CONTAINER;

  type: string = DesignNodeType.PANEL;

  component = 'DesignPanelComponent';

  static materialConfig: IMaterialData = {
    group: MaterialGroup.LAYOUT,
    label: '面板',
    type: DesignNodeType.PANEL,
    icon: 'icon-Collapse',
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
                    title: window.$t('sys.designView.components.panel.form.group'),
                    isContainer: true,
                    layout: 'grid',
                    children: [
                      {
                        type: 'hidden',
                        name: 'i18nConfig',
                      },
                      {
                        type: 'item',
                        name: 'title',
                        label: window.$t('sys.designView.components.panel.form.label'),
                        labelPosition: 'top',
                        defaultValue: window.$t('sys.designView.components.panel.title'),
                        noColon: true,
                        editor: {
                          type: EditorType.I18N,
                          max: 32,
                          props: {},
                        },
                      } as IFormItem,
                      {
                        type: 'item',
                        name: 'icon',
                        label: window.$t('sys.designView.components.panel.form.label2'),
                        labelPosition: 'top',
                        noColon: true,
                        editor: {
                          type: EditorType.ICON_SELECT,
                        },
                      } as IFormItem,
                      {
                        type: 'container',
                        name: 'group_1',
                        layout: 'grid',
                        children: [
                          {
                            type: 'item',
                            name: 'label_info',
                            labelWidth: '0',
                            defaultValue: window.$t('sys.designView.components.panel.form.label3'),
                            gridItem: {
                              span: 14,
                            },
                            editor: {
                              type: EditorType.SPAN,
                            },
                            style: {
                              margin: 0,
                            },
                          },
                          {
                            type: 'item',
                            name: 'defaultCollapse',
                            defaultValue: true,
                            noColon: true,
                            gridItem: {
                              span: 10,
                            },
                            editor: {
                              type: EditorType.CHECK_SWITCH,
                              label: window.$t(
                                'sys.designView.components.panel.code.defaultCollapse',
                              ),
                            },
                            style: {
                              margin: 0,
                            },
                          },
                        ] as IFormItem[],
                      },
                      {
                        type: 'item',
                        name: 'collapse',
                        noColon: true,
                        labelWidth: '0',
                        dictionary: {
                          tag: 'Is the panel folded',
                          mode: 'static',
                          items: [
                            {
                              label: window.$t('sys.designView.components.panel.code.support'),
                              value: 1,
                            },
                            {
                              label: window.$t('sys.designView.components.panel.code.notSupport'),
                              value: 0,
                            },
                          ],
                        },
                        editor: {
                          type: EditorType.RADIO,
                        },
                      } as IFormItem,
                    ],
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
                        label: window.$t('sys.designView.form.position'),
                        name: 'position',
                        noColon: true,
                        labelAlign: 'left',
                        labelWidth: '34px',
                        editor: {
                          type: DesignEditorType.STYLE_POSITION,
                        },
                      },
                      {
                        type: 'item',
                        label: window.$t('sys.width'),
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
                        label: window.$t('sys.height'),
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
                    name: 'collapse-pane-font',
                    type: 'collapse-pane',
                    isContainer: true,
                    layout: 'grid',
                    title: window.$t('sys.designView.form.style'),
                    children: [
                      {
                        type: 'item',
                        label: '标题文字',
                        name: 'labelFont',
                        labelPosition: 'top',
                        editor: {
                          type: DesignEditorType.STYLE_FONT,
                        } as IStyleFont,
                      } as IFormItem,
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
                        } as IStyleSpacing,
                      } as IFormItem,
                    ] as IFormItem[],
                  },
                  {
                    name: 'collapse-pane-border',
                    type: 'collapse-pane',
                    isContainer: true,
                    layout: 'grid',
                    title: window.$t('sys.designView.form.border'),
                    children: [
                      {
                        type: 'item',
                        name: 'border',
                        editor: {
                          type: DesignEditorType.STYLE_BORDER,
                        } as IStyleBorder,
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

  create(data?: DesignPanelNode): DesignPanelNode {
    return new DesignPanelNode(data as unknown as DesignPanelNode);
  }
}
