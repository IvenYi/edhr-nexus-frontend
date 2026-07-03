import { computed, defineComponent, PropType, ref, toRefs, watch } from 'vue';
import { MenuProps } from 'ant-design-vue';
import { useNamespace } from '@gct-paas/core';
import { IFieldContextItem, IReportField } from '../../interface';
import { useReportViewController } from '../../hooks';
import { ReportFieldMenuSelect } from './report-field-menu-select';
import './report-field-context-menu.scss';

export const ReportFieldContextMenu = defineComponent({
  name: 'ReportFieldContextMenu',
  props: {
    data: {
      type: Object as PropType<IReportField>,
      required: true,
    },
  },
  emits: ['menu-click'],
  setup(props, { emit }) {
    const ns = useNamespace('report-field-context-menu');

    const { data } = toRefs(props);

    const reportView = useReportViewController();

    const items = ref<IFieldContextItem[]>([]);

    watch(
      data,
      () => {
        items.value = reportView.provider.value.getFieldMenus(data.value);
      },
      { immediate: true, deep: true },
    );

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
      if (!item) {
        console.error('没有找到对应的菜单', info);
        return;
      }
      if (item.mode === 'action') {
        if (item.click) {
          item.click(item, data.value);
          return;
        }
        emit('menu-click', item, data.value);
      }
    };

    function renderItem(item: IFieldContextItem, parent?: IFieldContextItem) {
      if (item.mode === 'action') {
        return (
          <a-menu-item key={item.name}>
            <span class={ns.e('label')}>{item.label}</span>
          </a-menu-item>
        );
      }
      if (item.mode === 'group') {
        return (
          <a-sub-menu>
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
      if (item.mode === 'select') {
        return <ReportFieldMenuSelect action={item} data={data.value} />;
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
