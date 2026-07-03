import {
  EditorType,
  IEditForm,
  IFormCollapse,
  IFormEditItem,
  IFormItem,
  IFormTab,
  IFormTabPane,
  IModalData,
  INumberEditor,
} from '@gct/runtime';
import { DesignEditorType, DesignNodeMode, DesignNodeType, MaterialGroup } from '../../constant';
import {
  IChildListEditor,
  IDesignViewController,
  IDragDataItem,
  IMaterialData,
  INodeProvider,
  IStyleBorder,
  IStyleSpacing,
} from '../../interface';
import { DesignGridNode } from './design-grid.data';
import { NodeBaseProvider } from '../../provider';
import { NodeRegister } from '../../register';

/**
 * 栅格容器
 *
 * @author zhanghanrui
 * @date 2024-07-16 17:07:32
 * @export
 * @class DesignGridProvider
 * @extends {NodeBaseProvider<DesignGridNode>}
 * @implements {INodeProvider<DesignGridNode>}
 */
export class DesignGridProvider
  extends NodeBaseProvider<DesignGridNode>
  implements INodeProvider<DesignGridNode>
{
  mode = DesignNodeMode.CONTAINER;

  type: string = DesignNodeType.GRID;

  override isDrop = false;

  component = 'DesignGridComponent';

  static materialConfig: IMaterialData = {
    group: MaterialGroup.LAYOUT,
    label: '栅格容器',
    type: DesignNodeType.GRID,
    icon: 'icon-grid',
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
                    style: { 'padding-top': 0 },
                    title: window.$t('sys.designView.components.grid.form.group'),
                    children: [
                      {
                        type: 'item',
                        labelPosition: 'top',
                        name: 'tabItems',
                        editor: {
                          title: window.$t('sys.designView.components.grid.form.label'),
                          type: DesignEditorType.CHILD_LIST_EDITOR,
                          childDesignType: DesignNodeType.GRID_ITEM,
                          childEditFieldKey: 'span',
                          sort: false,
                          select: false,
                          editorType: 'number',
                          editorProps: {
                            min: 1,
                            max: 24,
                          },
                          showLabel: true,
                          props: {
                            size: 'small',
                          },
                        } as IChildListEditor,
                      },
                      {
                        type: 'item',
                        label: window.$t('sys.designView.components.grid.form.label2'),
                        labelPosition: 'top',
                        name: 'gutter',
                        defaultValue: 20,
                        editor: {
                          type: EditorType.NUMBER,
                          addonAfter: 'px',
                          min: 0,
                          max: 100,
                          props: {
                            size: 'small',
                          },
                        } as INumberEditor,
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
                          showArea: ['margin'],
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
                          showArea: ['basics'],
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

  create(data?: DesignGridNode): DesignGridNode {
    return new DesignGridNode(data as unknown as DesignGridNode);
  }

  async beforeDrop(
    c: IDesignViewController,
    item?: IDragDataItem<DesignGridNode>,
  ): Promise<DesignGridNode | null> {
    c.store.disableCache();
    return item ? item.data : null;
  }

  async afterDrop(
    c: IDesignViewController,
    item?: IDragDataItem<DesignGridNode>,
  ): Promise<boolean> {
    if (!item) {
      return false;
    }
    const { data } = item;
    const children = c.store.getChildren(data);
    if (children && children.length > 0) {
      return false;
    }
    const res = await gct.openUtil.modal<IModalData>(
      'col-modal',
      {},
      { title: window.$t('sys.designView.components.grid.modal.title'), width: 642 },
    );
    if (res && res.ok && res.data) {
      const d = res.data[0];
      if (d && d.spanArr) {
        const items: number[] = d.spanArr;
        for (let i = 0; i < items.length; i++) {
          const span = items[i];
          const params: IData = {
            data: { span },
          };
          const node = NodeRegister.get(DesignNodeType.GRID_ITEM, c.store.prefix)!.create(
            params as any,
          );
          node.data.name = `${node.data.name}${i + 1}`;
          c.store.setNode(data.id, node as DesignGridNode);
        }
      }
      c.store.enableCache();
      c.store.cacheHistory();
      return true;
    }
    c.store.deleteNode(data.id);
    return false;
  }
}
