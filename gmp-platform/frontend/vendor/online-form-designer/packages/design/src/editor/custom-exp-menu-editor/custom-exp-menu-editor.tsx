import { computed, defineComponent } from 'vue';
import { IFormItem, IModalData, useGctFormValue, useNamespace } from '@gct/runtime';
import { IMobileHomeMenuItem } from '@gct/base';
import { CustomExpMenuItem } from './components/custom-exp-menu-item';
import { ICustomExpMenuModel } from './i-custom-exp-menu-model';
import { ExpMenuModal } from './modal/exp-menu.modal';
import { cloneDeep } from 'lodash-es';
import { uuid } from '@jsplumb/browser-ui';
import './custom-exp-menu-editor.scss';

export const CustomExpMenuEditor = defineComponent({
  name: 'CustomExpMenuEditor',
  props: {
    itemModel: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
    model: {
      type: Object as PropType<ICustomExpMenuModel>,
      required: true,
    },
    value: {
      type: Array as PropType<IMobileHomeMenuItem[]>,
    },
  },
  setup(props) {
    const ns = useNamespace('custom-exp-menu-editor');

    const val = useGctFormValue<IMobileHomeMenuItem[]>();

    const { activeMax = 5 } = props.model;

    const activeCount = computed(() => {
      return val.value.filter((item) => item.isHidden !== true).length;
    });

    const onAdd = async (e: MouseEvent) => {
      e.stopPropagation();
      const data = {
        id: uuid(),
        label: '',
        menuMode: 'system',
        presetType: 'message',
        icon: {
          icon: 'icon-park:all-application',
          color: 'var(--van-text-color)',
        },
        selectIcon: {
          icon: 'icon-park:all-application',
          color: 'var(--ant-primary-color)',
        },
        isSystem: false,
        isHidden: activeCount.value >= activeMax ? true : false,
        isHome: false,
      } as IMobileHomeMenuItem;
      const res = await gct.openUtil.modal<IModalData>(
        ExpMenuModal,
        {
          data,
        },
        {
          title: window.$t('sys.developer.designView.newMenu'),
          width: '640px',
          height: '640px',
        },
      );
      if (res && res.ok && res.data) {
        val.value.push(Object.assign(data, res.data[0] as IMobileHomeMenuItem));
        // eslint-disable-next-line no-self-assign
        val.value = val.value;
      }
    };

    const onRemove = (data: IMobileHomeMenuItem) => {
      val.value = val.value.filter((item) => {
        return item.id !== data.id;
      });
    };

    const onEdit = async (data: IMobileHomeMenuItem) => {
      const i = val.value.findIndex((item) => item.id === data.id);
      const _data = cloneDeep(val.value[i]);
      const res = await gct.openUtil.modal<IModalData>(
        ExpMenuModal,
        {
          data,
        },
        {
          title: window.$t('sys.developer.designView.editMenu'),
          width: '640px',
          height: '640px',
        },
      );
      if (res && res.ok && res.data) {
        val.value.splice(i, 1, Object.assign(_data, res.data[0] as IMobileHomeMenuItem));
        // eslint-disable-next-line no-self-assign
        val.value = val.value;
      }
    };

    const onHome = (data: IMobileHomeMenuItem) => {
      val.value.forEach((item) => {
        item.isHome = item === data;
      });
      // eslint-disable-next-line no-self-assign
      val.value = val.value;
    };

    const onHidden = (data: IMobileHomeMenuItem) => {
      data.isHidden = true;
      // eslint-disable-next-line no-self-assign
      val.value = val.value;
    };

    const onShow = (data: IMobileHomeMenuItem) => {
      data.isHidden = false;
      // eslint-disable-next-line no-self-assign
      val.value = val.value;
    };

    return { ns, activeCount, val, onAdd, onRemove, onEdit, onHome, onHidden, onShow };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('button')}>
          <a-button onClick={this.onAdd}>{window.$t('sys.developer.designView.addMenu')}</a-button>
        </div>
        <div class={this.ns.e('info')}>{window.$t('sys.developer.designView.suggest')}</div>
        <div class={this.ns.e('menus')}>
          <vue3-dnd-draggable items={this.val}>
            {{
              draggableItem: ({ item }: { item: IMobileHomeMenuItem }) => {
                return (
                  <CustomExpMenuItem
                    isHidden={!(item.isHidden === false && this.activeCount === 1)}
                    data={item}
                    onRemove={this.onRemove}
                    onEdit={this.onEdit}
                    onHome={this.onHome}
                    onHidden={this.onHidden}
                    onShow={this.onShow}
                  />
                );
              },
            }}
          </vue3-dnd-draggable>
        </div>
      </div>
    );
  },
});
