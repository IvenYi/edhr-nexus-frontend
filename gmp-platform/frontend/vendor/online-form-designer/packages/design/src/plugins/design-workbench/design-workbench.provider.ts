import {
  EditorType,
  IEditForm,
  IFormCollapse,
  IFormEditItem,
  IFormItem,
  IFormTab,
  IFormTabPane,
  WorkbenchType,
} from '@gct/runtime';
import { DesignEditorType, DesignNodeMode, DesignNodeType, MaterialGroup } from '../../constant';
import { IMaterialData, INodeProvider, IStyleSpacing } from '../../interface';
import { DesignWorkbenchNode } from './design-workbench.data';
import { NodeBaseProvider } from '../../provider';

export class DesignWorkbenchProvider
  extends NodeBaseProvider<DesignWorkbenchNode>
  implements INodeProvider<DesignWorkbenchNode>
{
  mode = DesignNodeMode.CONTAINER;

  type: string = DesignNodeType.WORKBENCH;

  component = 'DesignWorkbenchComponent';

  static materialConfig: IMaterialData = {
    group: MaterialGroup.SYSTEM,
    label: '工作台',
    type: DesignNodeType.WORKBENCH,
    icon: 'icon-yidongduan-gongzuotai',
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
                    title: '工作台配置',
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
                              label: $t(`sys.portal.${WorkbenchType.TEST}`),
                              value: WorkbenchType.TEST,
                            },
                            {
                              label: $t(`sys.portal.${WorkbenchType.QUICK}`),
                              value: WorkbenchType.QUICK,
                            },
                            {
                              label: $t(`sys.portal.${WorkbenchType.MY}`),
                              value: WorkbenchType.MY,
                            },
                          ],
                        },
                        editor: {
                          type: EditorType.CHECKBOX,
                          layout: 'column',
                          minLength: 1,
                          isDrag: true,
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

  create(data?: DesignWorkbenchNode): DesignWorkbenchNode {
    return new DesignWorkbenchNode(data as unknown as DesignWorkbenchNode);
  }
}
