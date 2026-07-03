import { PageDesignView } from '../page-design-view';
import { PageTypeEnum } from '/@/layouts/tree-sider-page-new/enum';
import { PageDesignViewRouteParams } from '../page-design-view.interface';
import { useRouter } from 'vue-router';
import { IModalData } from '@gct/runtime';

export function usePageDesignUtil() {
  const router = useRouter();

  /**
   * 打开页面设计器视图
   *
   * @param {string} id 页面ID
   * @param {PageTypeEnum} mode 页面模式(WEB/MOBILE)
   * @param {string} [category] 分类ID
   * @return {*} 打开结果
   */
  async function openPageDesignView(id: string, mode: PageTypeEnum, category?: string) {
    // 使用 Vue Router 的 replace 方法更新查询参数，但保持当前路由路径不变。用于刷新后直接再次打开设计界面
    const query = router.currentRoute.value.query;
    if (query.id !== id) {
      // 如果当前路由已经有相同的 id 查询参数，则不进行替换，避免重复操作
      router.replace({
        query: { id, mode },
        path: router.currentRoute.value.path,
      });
    }

    // 准备参数
    const params: PageDesignViewRouteParams = {
      id,
      mode,
    };

    // 如果有分类ID，加入到参数中
    if (category) {
      params.category = category;
    }

    // 打开全屏设计器，不触发路由切换
    const res = await gct.openUtil.fullScreen<IModalData<{ id: string }>>(
      PageDesignView,
      {
        params,
      },
      {},
    );
    // 删除路由中的查询参数
    router.replace({
      query: {},
      path: router.currentRoute.value.path,
    });
    return res;
  }

  return {
    openPageDesignView,
  };
}
