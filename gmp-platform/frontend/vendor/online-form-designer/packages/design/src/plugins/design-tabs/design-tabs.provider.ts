import {
  EditorType,
  FormEditItemController,
  IEditForm,
  IFormCollapse,
  IFormEditItem,
  IFormItem,
  IFormTab,
  IFormTabPane,
  INumberEditor,
} from '@gct/runtime';
import { IDragDataItem, TabType } from '@gct/base';
import { DesignEditorType, DesignNodeMode, DesignNodeType, MaterialGroup } from '../../constant';
import {
  IChildListEditor,
  IDesignViewController,
  IMaterialData,
  INodeProvider,
  IStyleBorder,
  IStyleSpacing,
} from '../../interface';
import { DesignTabsNode } from './design-tabs.data';
import { NodeBaseProvider } from '../../provider';
import { NodeRegister } from '../../register';

/**
 * 选项卡
 *
 * @author zhanghanrui
 * @date 2024-07-16 17:07:32
 * @export
 * @class DesignTabsProvider
 * @extends {NodeBaseProvider<DesignTabsNode>}
 * @implements {INodeProvider<DesignTabsNode>}
 */
export class DesignTabsProvider
  extends NodeBaseProvider<DesignTabsNode>
  implements INodeProvider<DesignTabsNode>
{
  mode = DesignNodeMode.CONTAINER;

  type: string = DesignNodeType.TABS;

  override isDrop = false;

  component = 'DesignTabsComponent';

  static materialConfig: IMaterialData = {
    group: MaterialGroup.LAYOUT,
    label: '选项卡',
    type: DesignNodeType.TABS,
    icon: 'icon-biaoqianye',
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
                    title: window.$t('sys.designView.components.tab.form.group'),
                    children: [
                      {
                        type: 'hidden',
                        name: 'defaultTab',
                      },
                      {
                        type: 'item',
                        labelPosition: 'top',
                        name: 'tabItems',
                        editor: {
                          title: window.$t('sys.designView.components.tab.form.label'),
                          type: DesignEditorType.CHILD_LIST_EDITOR,
                          childDesignType: DesignNodeType.TAB_ITEM,
                          childEditFieldKey: 'title',
                          sort: true,
                          select: true,
                          defaultSelectChildKey: 'defaultTab',
                          editorType: 'i18n',
                        } as IChildListEditor,
                      },
                      {
                        type: 'item',
                        label: window.$t('sys.designView.components.tab.form.label2'),
                        labelPosition: 'top',
                        name: 'tabType',
                        dictionary: TabType,
                        defaultValue: 'base',
                        editor: {
                          type: EditorType.RADIO,
                          buttonMode: true,
                        },
                        watch(form, item, val, oldVal) {
                          if (val !== oldVal) {
                            const c = form.item.gutter as FormEditItemController;
                            this[oldVal] = c.value;
                            if (this[val] != null) {
                              c.value = this[val];
                              return;
                            }
                            switch (val) {
                              case 'base':
                                c.value = 20;
                                break;
                              case 'card':
                                c.value = 8;
                                break;
                              default:
                                c.value = 0;
                            }
                          }
                        },
                      },
                      {
                        type: 'item',
                        label: window.$t('sys.designView.components.tab.form.label3'),
                        labelPosition: 'top',
                        name: 'gutter',
                        defaultValue: 20,
                        hidden(_form, _item, data) {
                          const type = data.tabType;
                          return type === 'text' || type === 'capsule';
                        },
                        editor: {
                          type: EditorType.NUMBER,
                          addonAfter: 'px',
                          min: 0,
                          max: 300,
                          props: {
                            size: 'small',
                          },
                        } as INumberEditor,
                      },
                      {
                        type: 'item',
                        label: window.$t('sys.designView.components.tab.form.label4'),
                        name: 'center',
                        editor: {
                          type: EditorType.SWITCH,
                          props: {
                            size: 'small',
                          },
                        },
                      },
                      {
                        type: 'item',
                        label: window.$t('sys.designView.components.tab.form.label5'),
                        labelTooltip: window.$t('sys.designView.components.tab.form.label5Tip'),
                        name: 'selectDestroy',
                        editor: {
                          type: EditorType.SWITCH,
                          props: {
                            size: 'small',
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
                        label: window.$t('sys.designView.form.position'),
                        name: 'position',
                        noColon: true,
                        labelAlign: 'left',
                        labelWidth: '34px',
                        editor: {
                          type: DesignEditorType.STYLE_POSITION,
                        },
                      },
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

  create(data?: DesignTabsNode): DesignTabsNode {
    return new DesignTabsNode(data as unknown as DesignTabsNode);
  }
  async beforeDrop(
    c: IDesignViewController,
    item?: IDragDataItem<DesignTabsNode>,
  ): Promise<DesignTabsNode | null> {
    c.store.disableCache();
    return item ? item.data : null;
  }

  async afterDrop(
    c: IDesignViewController,
    item?: IDragDataItem<DesignTabsNode>,
  ): Promise<boolean> {
    if (!item) {
      return false;
    }
    const { data } = item;
    const children = c.store.getChildren(data);
    if (children && children.length > 0) {
      return false;
    }
    const node = NodeRegister.get(DesignNodeType.TAB_ITEM, c.store.prefix)!.create();
    data.data.defaultTab = node.id;
    c.store.setNode(data.id, node as DesignTabsNode);
    c.store.enableCache();
    c.store.cacheHistory();
    return true;
  }
}
