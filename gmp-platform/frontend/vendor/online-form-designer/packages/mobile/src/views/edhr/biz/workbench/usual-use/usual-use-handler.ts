import { GctPopup } from '@mobile/utils/popup';
import {
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as get,
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as post,
  postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey as postGeneral,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { useRouter } from 'vue-router';
import MenuSelectorPopup from './menu-selector-popup.vue';

export interface IMenu {
  id: string;
  title: string;
  icon: string;
  /** 跳转路径*/
  linkPage: string;
}
export class UsualUseHandler {
  menus: IMenu[] = [];
  loading: boolean = false;
  router: any;

  constructor() {
    this.router = useRouter();
  }

  /**
   * 加载菜单
   */
  async loadMenus() {
    this.loading = true;
    try {
      const res = await postGeneral(
        {
          modelCategory: 'entity',
          modelKey: 'em_common_use_menu',
          bsKey: 'biz_search',
        },
        {},
        {
          type: 'PAD',
        },
      );
      console.log('em_common_use_menu', res);
      this.menus = (res ?? []).map((i) => {
        return {
          id: i.id,
          title: i.name,
          icon: i.logo,
          linkPage: i.linkPage,
          color: i.color,
        };
      });
    } finally {
      this.loading = false;
    }
  }

  /**
   * 配置菜单
   */
  async editMenu() {
    GctPopup.open(MenuSelectorPopup, {
      selectedIds: this.menus.map((m) => m.id),
      onOk: async (arr) => {
        console.log('popup close', arr);
        const res = await postGeneral(
          {
            modelCategory: 'entity',
            modelKey: 'em_common_use_menu',
            bsKey: 'biz_save',
          },
          {
            type: 'PAD',
            ids: arr,
          },
        );
        this.loadMenus();
      },
    });
  }

  /**
   * 跳转页面
   * @param menu
   */
  go(menu: IMenu) {
    console.log('menu', menu);
    this.router.push({
      name: menu.linkPage,
    });
  }
}
