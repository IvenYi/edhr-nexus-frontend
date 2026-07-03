import { computed, defineComponent, PropType } from 'vue';
import { MenuProps } from 'ant-design-vue';
import { useNamespace } from '@gct-paas/core';
import { IFieldContextItem, IReportField } from '../../interface';
import { getFieldMenus } from '../../hooks/hooks';
import { DatavFieldMenuSelect } from '../datav-field-menu-select/datav-field-menu-select';
import './datav-field-context-menu.scss';
import { emptyValueEnum, sortTypeEnum, fieldTypeEnum, MENU_ACTION } from '../../interface/type';

export const DatavFieldContextMenu = defineComponent({
  name: 'DatavFieldContextMenu',
  props: {
    data: {
      type: Object as PropType<IReportField>,
      required: true,
    },
    datasetId: {
      type: String,
    },
  },
  emits: ['menu-click'],
  setup(props, { emit }) {
    const ns = useNamespace('datav-field-context-menu');

    const items = computed<IFieldContextItem[]>(() => {
      return getFieldMenus(props.data);
    });

    const flatItems = computed<IFieldContextItem[]>(() => {
      const arr: IFieldContextItem[] = [];
      function flat(items: IFieldContextItem[]) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          arr.push(item);
          if (item.children) {
            flat(item.children);
          }
        }
      }
      flat(items.value);
      return arr;
    });

    const onClick: MenuProps['onClick'] = (info): void => {
      const { key } = info;
      const item = flatItems.value.find((item) => item.name === key);
      console.log('onClick----info', info, item, props.data);
      if (!item) {
        console.error('没有找到对应的菜单', info);
        return;
      }
      if (
        item?.mode === 'action' &&
        [MENU_ACTION.CHANGE_NAME, MENU_ACTION.DELETE, MENU_ACTION.EDIT].includes(
          item?.name as unknown as MENU_ACTION,
        )
      ) {
        if (item?.click) {
          item.click(item, props.data);
          return;
        }
        emit('menu-click', item, props.data);
        return;
      }

      if (
        item?.mode === 'select-item' ||
        (item?.mode === 'action' && item?.name !== MENU_ACTION.CHANGE_NAME)
      ) {
        const obj = {};
        if (Object.values(emptyValueEnum).includes(key)) {
          obj['emptyValue'] = key;
        }
        if (Object.values(sortTypeEnum).includes(key)) {
          obj['sortType'] = key;
        }
        if (Object.values(fieldTypeEnum).includes(key)) {
          obj['fieldType'] = key;
        }
        emit('menu-click', obj, props.data);
      }
    };

    function renderItem(item: IFieldContextItem, parent?: IFieldContextItem) {
      if (item.mode === 'action') {
        return (
          <a-menu-item key={item.name}>
            <span
              v-if={['dim', 'meas'].includes(parent?.name || '')}
              class={[ns.e('icon'), 'iconfont', ns.e(parent?.name), item.icon]}
            ></span>
            <span class={ns.e('label')}>{item.label}</span>
          </a-menu-item>
        );
      }
      if (item.mode === 'group') {
        return (
          <a-sub-menu key={item.name}>
            {{
              title: () => {
                return <span class={ns.e('label')}>{item.label}</span>;
              },
              default: () => {
                return item.children?.map((child: IFieldContextItem) => {
                  return renderItem(child, item);
                });
              },
            }}
          </a-sub-menu>
        );
      }
      if (item.mode === 'group-item') {
        return (
          <a-menu-item-group key={item.name}>
            {{
              title: () => {
                return <span class={ns.e('label')}>{item.label}</span>;
              },
              default: () => {
                return item.children?.map((child: IFieldContextItem) => {
                  return renderItem(child, item);
                });
              },
            }}
          </a-menu-item-group>
        );
      }
      if (item.mode === 'select') {
        return (
          <DatavFieldMenuSelect
            action={item}
            data={props.data}
            disabled={!props.datasetId && item.name == 'SortType'}
          />
        );
      }
    }

    return { ns, items, onClick, renderItem };
  },
  render() {
    return (
      <a-dropdown>
        {{
          default: () => {
            return (
              <a class="ant-dropdown-link">
                <i class="iconfont icon-gengduo" />
              </a>
            );
          },
          overlay: () => {
            return (
              <a-menu onClick={this.onClick}>
                {this.items.map((item: IFieldContextItem) => {
                  return this.renderItem(item);
                })}
              </a-menu>
            );
          },
        }}
      </a-dropdown>
    );
  },
});
