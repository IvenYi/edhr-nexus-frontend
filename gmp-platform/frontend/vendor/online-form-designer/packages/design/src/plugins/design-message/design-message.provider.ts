import {
  EditorType,
  IEditForm,
  IFormCollapse,
  IFormEditItem,
  IFormItem,
  IFormTab,
  IFormTabPane,
  MessageType,
} from '@gct/runtime';
import { DesignEditorType, DesignNodeMode, DesignNodeType, MaterialGroup } from '../../constant';
import { IMaterialData, INodeProvider, IStyleSpacing } from '../../interface';
import { DesignMessageNode } from './design-message.data';
import { NodeBaseProvider } from '../../provider';

export class DesignMessageProvider
  extends NodeBaseProvider<DesignMessageNode>
  implements INodeProvider<DesignMessageNode>
{
  mode = DesignNodeMode.CONTAINER;

  type: string = DesignNodeType.MESSAGE;

  component = 'DesignMessageComponent';

  static materialConfig: IMaterialData = {
    group: MaterialGroup.SYSTEM,
    label: '消息',
    type: DesignNodeType.MESSAGE,
    icon: 'icon-yidongduan-xiaoxi',
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
                    title: '消息配置',
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
                              label: $t(`sys.menu.message.${MessageType.ALL}`),
                              value: MessageType.ALL,
                            },
                            {
                              label: $t(`sys.menu.message.${MessageType.UNREAD}`),
                              value: MessageType.UNREAD,
                            },
                          ],
                        },
                        editor: {
                          type: EditorType.CHECKBOX,
                          layout: 'row',
                          minLength: 1,
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
                    name: 'collapse-pane-layout',
                    type: 'collapse-pane',
                    isContainer: true,
                    layout: 'grid',
                    title: '布局',
                    children: [
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

  create(data?: DesignMessageNode): DesignMessageNode {
    return new DesignMessageNode(data as unknown as DesignMessageNode);
  }
}
