import { computed, defineComponent, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import { nodeProps as props } from '@gct/runtime-render';
import { chunk, cloneDeep } from 'lodash-es';
import { getMenuConfigAvailableList } from '/@/apis/gct-apaas/MenuConfigController';
import { IDesignMenuListNode } from '@gct/runtime-design/src/plugins/design-menu-list/design-menu-list.data';
import { MenuItem } from '../../interface';
import { list_to_tree, uuid2 } from '../../utils';
import { LogoTypeEnum } from '../../constant';
import './render-menu-list.scss';

export const RenderMenuList = defineComponent({
  name: 'RenderMenuList',
  props,
  setup(defProps) {
    const ns = useNamespace('render-menu-list');

    const search = ref<string>('');

    const menuOptions = ref<MenuItem[]>([]);

    const filterMenus = computed(() => {
      const arr = cloneDeep(menuOptions.value);
      return arr.filter((item) => {
        if (item.children) {
          item.children = item.children.filter((i) => i.name.includes(search.value));
          return item.children.length > 0;
        }
        return false;
      });
    });

    const data = defProps.model.data as IDesignMenuListNode;

    const splitSize = computed(() => {
      const { rowNum, colNum } = data;
      return rowNum * colNum;
    });

    const span = computed(() => {
      return `${100 / data.colNum}%`;
    });

    const loadMenus = async () => {
      const res = await getMenuConfigAvailableList({ menuType: 'MOBILE' });
      if (res) {
        menuOptions.value = list_to_tree(
          res
            .filter((i) => i.visible === 1 && !i.sysBuiltin)
            .map((i) => ({ ...i, logoType: LogoTypeEnum.Icon })),
        ).filter((e) => e.children.length);
      } else {
        menuOptions.value = [];
      }
    };

    loadMenus();

    const onClick = (e: MouseEvent, menu: any) => {
      e.stopPropagation();
      if (defProps.preview) {
        return;
      }
      const router = (window as any).___router;
      if (menu.linkPage) {
        const hash = uuid2(4);
        router.push({
          path: `/appPage/${hash}/${menu.linkPage + ''}`,
          query: { menuName: menu.name, hash },
        });
      } else if (menu.url) {
        window.location.href = menu.url;
      }
    };

    function renderMenu(menu: MenuItem) {
      return (
        <van-col
          style={{ width: span.value }}
          class={[ns.b('menu'), ns.bm('menu', data.mode)]}
          onClick={(e) => onClick(e, menu)}
        >
          <div class={ns.be('menu', 'icon')} style={{ '--color': menu.color }}>
            <menu-image size="24" src={menu.logo} logoType={menu.logoType} />
          </div>
          <div class={[ns.be('menu', 'label'), ns.is('wrap', data.titleOverflow === 'wrap')]}>
            {menu.name}
          </div>
        </van-col>
      );
    }

    function renderMenus(menus: MenuItem[]) {
      return (
        <van-row class={ns.b('menus')}>
          {menus.map((menu) => {
            return renderMenu(menu);
          })}
        </van-row>
      );
    }

    function renderContent(menus: MenuItem[]) {
      const arr = chunk(menus, splitSize.value);
      return (
        <van-swipe class={ns.b('swipe')} autoplay={99999999}>
          {arr.map((items) => {
            return <van-swipe-item>{renderMenus(items)}</van-swipe-item>;
          })}
        </van-swipe>
      );
    }

    function renderGroup(menu: MenuItem) {
      return (
        <div class={ns.b('group')}>
          <div class={ns.be('group', 'title')}>{menu.name}</div>
          <div class={ns.be('group', 'content')}>
            {data.enabledRange
              ? renderContent(menu.children || [])
              : renderMenus(menu.children || [])}
          </div>
        </div>
      );
    }

    function renderSearch() {
      if (data.enableSearch !== true) {
        return null;
      }
      return (
        <div class={ns.e('search')}>
          <van-search v-model={search.value} placeholder="搜索" background="transparent" />
        </div>
      );
    }

    return { ns, search, filterMenus, renderGroup, renderSearch };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.renderSearch()}
        <div class={this.ns.e('content')}>
          {this.filterMenus.map((menu) => {
            return this.renderGroup(menu);
          })}
        </div>
      </div>
    );
  },
});
