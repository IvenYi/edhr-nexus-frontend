import {
  EditorType,
  IEditForm,
  IFormCollapse,
  IFormEditItem,
  IFormItem,
  IFormTab,
  IFormTabPane,
  PersonalCenterType,
} from '@gct/runtime';
import { DesignEditorType, DesignNodeMode, DesignNodeType, MaterialGroup } from '../../constant';
import { IMaterialData, INodeProvider, IStyleSpacing } from '../../interface';
import { DesignPersonalCenterNode } from './design-personal-center.data';
import { NodeBaseProvider } from '../../provider';

export class DesignPersonalCenterProvider
  extends NodeBaseProvider<DesignPersonalCenterNode>
  implements INodeProvider<DesignPersonalCenterNode>
{
  mode = DesignNodeMode.CONTAINER;

  type: string = DesignNodeType.PERSONAL_CENTER;

  component = 'DesignPersonalCenterComponent';

  static materialConfig: IMaterialData = {
    group: MaterialGroup.SYSTEM,
    label: '我的',
    type: DesignNodeType.PERSONAL_CENTER,
    icon: 'icon-yidongduan-wode',
    order: 0,
  };

  model: IEditForm = {
    type: 'edit',
    noColon: true,
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
            title: '属性',
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
                    title: '个人中心配置',
                    children: [
                      {
                        type: 'item',
                        name: 'displayContent',
                        label: '显示内容',
                        labelPosition: 'top',
                        noColon: true,
                        dictionary: {
                          tag: 'display content',
                          mode: 'static',
                          rules: [{ required: true }],
                          items: [
                            {
                              label: $t(`sys.menu.personal.${PersonalCenterType.PROFILE}`),
                              value: PersonalCenterType.PROFILE,
                            },
                            {
                              label: $t(`sys.menu.personal.${PersonalCenterType.GENDER}`),
                              value: PersonalCenterType.GENDER,
                            },
                            {
                              label: $t(`sys.menu.personal.${PersonalCenterType.ENTERPRISE}`),
                              value: PersonalCenterType.ENTERPRISE,
                            },
                          ],
                        },
                        editor: {
                          type: EditorType.CHECKBOX,
                          layout: 'column',
                        },
                      } as IFormItem,
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
            title: '样式',
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
                    title: '边距',
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
                          showArea: ['margin'],
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

  create(data?: DesignPersonalCenterNode): DesignPersonalCenterNode {
    return new DesignPersonalCenterNode(data as unknown as DesignPersonalCenterNode);
  }
}
