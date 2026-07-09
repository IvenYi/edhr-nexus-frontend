// 分类树接口操作；
import { Modal, message } from 'ant-design-vue';
import { CategoryModuleEnum } from '../constant';
import { CategoryCompleteVO, CategoryDragDTO } from '/@/apis/gct-apaas/model';
import {
  deleteFormRelateCategory,
  postFormRelateCategory,
  putFormRelateCategoryById,
  putFormRelateCategoryDrag,
} from '/@/apis/gct-apaas/FormRelateCategoryController';
import {
  deleteEdhrCategory,
  postEdhrCategory,
  putEdhrCategoryById,
  putEdhrCategoryDrag,
} from '/@/apis/gct-apaas/EdhrCategoryController';
import {
  deleteInspectionCategory,
  postInspectionCategory,
  putInspectionCategoryById,
  putInspectionCategoryDrag,
} from '/@/apis/gct-apaas/InspectionCategoryController';
import {
  deleteProductReleaseCategory,
  postProductReleaseCategory,
  putProductReleaseCategoryById,
  putProductReleaseCategoryDrag,
} from '/@/apis/gct-apaas/ProductReleaseCategoryController';
import {
  deleteOnlineFormCategory,
  postOnlineFormCategory,
  putOnlineFormCategoryById,
  putOnlineFormCategoryDrag,
} from '/@/apis/gct-apaas/OnlineFormCategoryController';
import { ref } from 'vue';
import { recursiveIterate } from '/@/utils/recursive';
import { CategoryModal } from '../category';
import { cacheFnReturn, getInterfaceApi } from '@gct/runtime';

function _useCategory(opts: { module: CategoryModuleEnum }) {
  const categoryMap = new Map<string, CategoryCompleteVO>();
  const categoryTreeData = ref<CategoryCompleteVO[]>();

  const needOldInterface = opts.module === CategoryModuleEnum.CHECK_LIST_MODULE;

  const apis = {
    // 获取列表
    getList: (p: any) => {
      return getInterfaceApi.getCategoryList(
        {
          needOldInterface,
          moduleType: opts.module,
        },
        { errorMessageMode: 'none' },
      );
    },

    // 删除
    remove: (p: any) => {
      if (needOldInterface) {
        return deleteFormRelateCategory({ id: p.id!, moduleType: opts.module });
      }
      if (opts.module === CategoryModuleEnum.EDHR) {
        return deleteEdhrCategory({ id: p.id! });
      }
      if (opts.module === CategoryModuleEnum.INSPECTION) {
        return deleteInspectionCategory({ id: p.id! });
      }
      if (opts.module === CategoryModuleEnum.RELEASE) {
        return deleteProductReleaseCategory({ id: p.id! });
      }
      return deleteOnlineFormCategory({ id: p.id! });
    },

    // 新增
    create: (p: any) => {
      if (needOldInterface) {
        return postFormRelateCategory({ ...p, module: opts.module });
      }
      if (opts.module === CategoryModuleEnum.EDHR) {
        return postEdhrCategory(p);
      }
      if (opts.module === CategoryModuleEnum.INSPECTION) {
        return postInspectionCategory(p);
      }
      if (opts.module === CategoryModuleEnum.RELEASE) {
        return postProductReleaseCategory(p);
      }
      return postOnlineFormCategory(p);
    },

    // 更新
    update: (p: any, data: any) => {
      if (needOldInterface) {
        return putFormRelateCategoryById({ id: p.id }, data);
      }
      if (opts.module === CategoryModuleEnum.EDHR) {
        return putEdhrCategoryById({ id: p.id }, data);
      }
      if (opts.module === CategoryModuleEnum.INSPECTION) {
        return putInspectionCategoryById({ id: p.id }, data);
      }
      if (opts.module === CategoryModuleEnum.RELEASE) {
        return putProductReleaseCategoryById({ id: p.id }, data);
      }
      return putOnlineFormCategoryById({ id: p.id }, data);
    },

    // 拖拽排序
    dragOrder: (p: any) => {
      if (needOldInterface) {
        return putFormRelateCategoryDrag(p);
      }
      if (opts.module === CategoryModuleEnum.EDHR) {
        return putEdhrCategoryDrag(p);
      }
      if (opts.module === CategoryModuleEnum.INSPECTION) {
        return putInspectionCategoryDrag(p);
      }
      if (opts.module === CategoryModuleEnum.RELEASE) {
        return putProductReleaseCategoryDrag(p);
      }
      return putOnlineFormCategoryDrag(p);
    },
  };

  /**
   * 通过id获取完整分类数据信息
   */
  function getCategoryById(id: string): CategoryCompleteVO | undefined {
    return categoryMap.get(id);
  }

  /**
   * 打开分类模态编辑完成之后返回更改后的数据
   * 取消操作返回undefined
   * @param opts
   * @return {*}
   */
  async function openCategoryModal(_opts: {
    data: CategoryCompleteVO;
  }): Promise<CategoryCompleteVO | undefined> {
    const isEdit = !!_opts.data.id;
    const res = await gct.openUtil.modal(
      CategoryModal,
      {
        data: _opts.data,
        module: opts.module,
      },
      {
        title: isEdit
          ? `${$t('sys.edit')}${$t('sys.category')}`
          : $t('sys.new') + $t('sys.category'),
        width: 640,
        height: 'auto',
        okText: $t('sys.okText'),
        showFooter: true,
      },
    );
    if (res.ok) {
      return res.data![0] as CategoryCompleteVO;
    }
  }

  /**
   * 创建分类
   */
  async function createCategory(data: { parentId?: string } = {}): Promise<{ parentId?: string }> {
    const res = await openCategoryModal({ data });
    let id;
    if (res) {
      id = await apis.create(res);
      await load();
      message.success($t('sys.createSuccess'));
    }
    return { parentId: res?.parentId, id };
  }

  /**
   * 加载数据（刷新也是）
   * @return {*}
   */
  async function load(): Promise<void> {
    let data: CategoryCompleteVO[] = [];
    try {
      data = (await apis.getList({})) || [];
    } catch (error) {
      console.error('[online-form] failed to load categories', error);
    }
    categoryTreeData.value = data;
    // 维护缓存map
    categoryMap.clear();
    recursiveIterate(
      data,
      ({ item }) => {
        categoryMap.set(item.id!, item);
      },
      { childrenFields: ['child'] },
    );
  }

  /**
   * 修改分类
   */
  async function editCategory(id: string): Promise<void> {
    const data = getCategoryById(id)!;
    const res = await openCategoryModal({ data });
    if (res) {
      await apis.update({ id }, res);
      await load();
      message.success($t('sys.developer.appCenter.editSuccess'));
    }
  }

  /**
   * 删除分类
   * 删除成功返回true
   * 取消或者删除失败返回false
   */
  async function deleteCategory(id: string): Promise<boolean> {
    const data = getCategoryById(id)!;

    let content;
    if (CategoryModuleEnum.CHECK_LIST_MODULE === opts.module) {
      content =
        data.parentId === 'ROOT' || !data.parentId
          ? $t('sys.webRender.edhrApplication.deleteCategoryTips')
          : $t('sys.webRender.edhrApplication.deleteTypeTips');
    } else {
      content = $t('sys.onlineForm.deleteCategoryTips', {
        sth: CategoryModuleEnum.ONLINE_FORM === opts.module ? $t('sys.expression.form') : 'DHR',
      });
    }

    return new Promise((resolve) => {
      Modal.confirm({
        title: $t('sys.sureToDeleteCategoryWithName', { name: `【${data.name}】` }),
        content: content,
        okText: $t('sys.okText'),
        cancelText: $t('sys.cancel'),
        async onOk() {
          try {
            await apis.remove({ id: data.id! });
            message.success($t('sys.delSuccess'));
            await load();
            resolve(true);
          } catch (error) {
            console.error(error);
            resolve(false);
          }
        },
        onCancel() {
          resolve(false);
        },
      });
    });
  }

  /**
   * 拖拽分类
   * @param data
   */
  async function dragCategory(data: CategoryDragDTO) {
    await apis.dragOrder(data);
    await load();
  }

  function getCategoryName(id: string): string {
    return categoryMap.get(id)?.name || '';
  }

  return {
    categoryTreeData,
    createCategory,
    load,
    editCategory,
    deleteCategory,
    getCategoryById,
    dragCategory,
    getCategoryName,
  };
}

export const useCategory = cacheFnReturn(_useCategory);
