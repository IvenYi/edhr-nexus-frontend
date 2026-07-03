import {
  EditorType,
  IEditForm,
  IFormCollapse,
  IFormEditItem,
  IFormItem,
  IFormTab,
  IFormTabPane,
  TODO_TYPE,
} from '@gct/runtime';
import { DesignEditorType, DesignNodeMode, DesignNodeType, MaterialGroup } from '../../constant';
import { IMaterialData, INodeProvider, IStyleSpacing } from '../../interface';
import { DesignTodoNode } from './design-todo.data';
import { NodeBaseProvider } from '../../provider';

export class DesignTodoProvider
  extends NodeBaseProvider<DesignTodoNode>
  implements INodeProvider<DesignTodoNode>
{
  mode = DesignNodeMode.CONTAINER;

  type: string = DesignNodeType.TODO;

  component = 'DesignTodoComponent';

  static materialConfig: IMaterialData = {
    group: MaterialGroup.SYSTEM,
    label: '审批',
    type: DesignNodeType.TODO,
    icon: 'icon-daiban',
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
                    title: '审批配置',
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
                              label: $t(`sys.menu.todo.${TODO_TYPE.TODO}`),
                              value: TODO_TYPE.TODO,
                            },
                            {
                              label: $t(`sys.menu.todo.${TODO_TYPE.APPLICATION}`),
                              value: TODO_TYPE.APPLICATION,
                            },
                            {
                              label: $t(`sys.menu.todo.${TODO_TYPE.DONE}`),
                              value: TODO_TYPE.DONE,
                            },
                            {
                              label: $t(`sys.menu.todo.${TODO_TYPE.DELEGATE}`),
                              value: TODO_TYPE.DELEGATE,
                            },
                          ],
                        },
                        editor: {
                          type: EditorType.CHECKBOX,
                          layout: 'column',
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
                name: 'collapse-pane-layout',
                type: 'collapse-pane',
                isContainer: true,
                layout: 'grid',
                title: window.$t('sys.designView.form.layout'),
                children: [
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

  create(data?: DesignTodoNode): DesignTodoNode {
    return new DesignTodoNode(data as unknown as DesignTodoNode);
  }
}
