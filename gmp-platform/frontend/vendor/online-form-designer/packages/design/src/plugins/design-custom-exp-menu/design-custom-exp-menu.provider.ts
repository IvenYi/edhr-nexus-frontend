import {
  EditorType,
  FormContainerType,
  IEditForm,
  IFormCollapse,
  IFormContainer,
  IFormItem,
  IFormTab,
  IFormTabPane,
} from '@gct/runtime';
import { DesignEditorType, DesignNodeMode, DesignNodeType, MaterialGroup } from '../../constant';
import { IMaterialData, INodeProvider } from '../../interface';
import { DesignCustomExpNodeNode } from './design-custom-exp-menu.data';
import { NodeBaseProvider } from '../../provider';

/**
 * 面板
 *
 * @author zhanghanrui
 * @date 2024-07-16 17:07:36
 * @export
 * @class DesignCustomExpMenuProvider
 * @extends {NodeBaseProvider<DesignCustomExpNodeNode>}
 * @implements {INodeProvider<DesignCustomExpNodeNode>}
 */
export class DesignCustomExpMenuProvider
  extends NodeBaseProvider<DesignCustomExpNodeNode>
  implements INodeProvider<DesignCustomExpNodeNode>
{
  mode = DesignNodeMode.PAGE;

  type: string = DesignNodeType.CUSTOM_EXP_MENU;

  component = 'DesignCustomExpMenuComponent';

  static materialConfig: IMaterialData = {
    group: MaterialGroup.LAYOUT,
    label: '面板',
    type: DesignNodeType.CUSTOM_EXP_MENU,
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
                    title: window.$t('sys.developer.designView.bottomExp'),
                    children: [
                      {
                        type: 'item',
                        name: 'menus',
                        labelWidth: '0',
                        editor: {
                          type: DesignEditorType.CUSTOM_EXP_MENU,
                        },
                      },
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
                    name: 'collapse-pane-layout',
                    type: 'collapse-pane',
                    isContainer: true,
                    layout: 'grid',
                    title: window.$t('sys.developer.designView.bottomExp2'),
                    children: [
                      {
                        isContainer: true,
                        type: FormContainerType.FORM_TITLE_GROUP,
                        title: window.$t('sys.developer.designView.menuName'),
                        layout: 'grid',
                        name: 'group_name',
                        children: [
                          {
                            type: 'item',
                            label: window.$t('sys.developer.designView.fontWeight'),
                            name: 'fontWeight',
                            noColon: true,
                            labelAlign: 'left',
                            labelWidth: '34px',
                            dictionary: {
                              tag: 'font_weight',
                              mode: 'static',
                              items: [
                                {
                                  label: '极细体',
                                  value: 1,
                                },
                                {
                                  label: '细体',
                                  value: 2,
                                },
                                {
                                  label: '常规体',
                                  value: 3,
                                },
                                {
                                  label: '中黑体',
                                  value: 4,
                                },
                                {
                                  label: '中粗体',
                                  value: 5,
                                },
                              ],
                            },
                            editor: {
                              type: EditorType.SELECT,
                            },
                          },
                          {
                            type: 'item',
                            label: window.$t('sys.developer.designView.notSelectColor'),
                            name: 'notSelectColor',
                            noColon: true,
                            labelAlign: 'left',
                            labelWidth: '68px',
                            editor: {
                              type: EditorType.COLOR,
                            },
                          },
                        ],
                      } as IFormContainer,
                    ],
                  },
                ],
              } as IFormCollapse,
            ],
          },
        ] as IFormTabPane[],
      } as IFormTab,
    ],
  };

  create(data?: DesignCustomExpNodeNode): DesignCustomExpNodeNode {
    return new DesignCustomExpNodeNode(data as unknown as DesignCustomExpNodeNode);
  }
}
