import { computed, defineComponent, toRefs } from 'vue';
import { useNamespace } from '@gct/runtime';
import { IDesignNode } from '@gct/base';
import { IDesignMenuListNode } from '../design-menu-list.data';
import './design-menu-list.component.scss';

export const DesignMenuListComponent = defineComponent({
  name: 'DesignMenuListComponent',
  props: {
    data: {
      type: Object as PropType<IDesignNode<IDesignMenuListNode>>,
      required: true,
    },
  },
  setup(props) {
    const t = window.$t;
    const ns = useNamespace('design-menu-list-component');

    const { data } = toRefs(props.data);

    const menus = computed(() => {
      if (!data.value || !data.value.rowNum || !data.value.colNum) {
        return [];
      }
      const { rowNum, colNum } = data.value;
      const arr: IData[] = [];
      for (let i = 0; i < rowNum * colNum; i++) {
        arr.push({
          id: i,
          name: `菜单名称`,
        });
      }
      return arr;
    });

    const span = computed(() => {
      if (!data.value || !data.value.rowNum || !data.value.colNum) {
        return null;
      }
      return `${100 / data.value.colNum}%`;
    });

    const renderMenuItem = (menu: IData, i: number) => {
      return (
        <van-col
          style={{ width: span.value }}
          class={[ns.b('menu-item'), ns.bm('menu-item', data.value.mode)]}
        >
          <div class={ns.be('menu-item', 'icon')}>
            <img src={`/assets/svg/icon-${(i % 10) + 1}.svg`} />
          </div>
          <div
            class={[ns.be('menu-item', 'name'), ns.is('wrap', data.value.titleOverflow === 'wrap')]}
          >
            {menu.name}
          </div>
        </van-col>
      );
    };

    const renderMenus = () => {
      return (
        <div class={ns.b('menu-group')}>
          <div class={ns.b('menu-group-header')}>
            <div class={ns.be('menu-group-header', 'menu-title-text')}>
              {t('sys.appDesigner.designView.components.menuList.group')}
            </div>
          </div>
          <van-row class={ns.b('menu-group-content')}>
            {menus.value.map((item, i) => {
              return renderMenuItem(item, i);
            })}
          </van-row>
        </div>
      );
    };

    const renderSearch = () => {
      if (data.value.enableSearch !== true) {
        return;
      }
      return (
        <div class={ns.b('search')}>
          <van-search placeholder={t('sys.searchText')} background="transparent" />
        </div>
      );
    };

    return { ns, renderMenus, renderSearch };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.renderSearch()}
        <div class={this.ns.b('card')}>
          {this.data.data.enabledRange ? (
            <van-swipe class="my-swipe" autoplay={9999999}>
              <van-swipe-item>{this.renderMenus()}</van-swipe-item>
              <van-swipe-item></van-swipe-item>
              <van-swipe-item></van-swipe-item>
              <van-swipe-item></van-swipe-item>
              <van-swipe-item></van-swipe-item>
            </van-swipe>
          ) : (
            this.renderMenus()
          )}
        </div>
      </div>
    );
  },
});
