// 分类树接口操作；

import { Modal, message } from 'ant-design-vue';
// import { CategoryModuleEnum } from '../type';
import { CategoryCompleteResponse, CategoryDragDTO } from '/@/apis/gct-apaas/model';
import {
  postCategory,
  getCategoryListComplete,
  putCategoryById,
  deleteCategory,
  postCategoryDrag,
} from '/@/apis/gct-apaas/CategoryController';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { ref, createVNode } from 'vue';
import { recursiveIterate } from '/@/utils/recursive';
import { CategoryModal } from '../../category';
import {
  cacheFnReturn,
  getInterfaceApi,
  CategoryModuleEnum as DHRCategoryModuleEnum,
} from '@gct/runtime';
import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';

function _useCategory(opts: { module: FormDesignEnum | DHRCategoryModuleEnum }) {
  const categoryMap = new Map<string, CategoryCompleteResponse>();
  const categoryTreeData = ref<CategoryCompleteResponse[]>();
  const isFormDesign = [
    FormDesignEnum.EDHR,
    DHRCategoryModuleEnum.INSPECTION,
    DHRCategoryModuleEnum.RELEASE,
    FormDesignEnum.ONLINE_FORM,
  ].includes(opts.module);

  /**
   * 通过id获取完整分类数据信息
   */
  function getCategoryById(id: string): CategoryCompleteResponse | undefined {
    return categoryMap.get(id);
  }

  /**
   * 打开分类模态编辑完成之后返回更改后的数据
   * 取消操作返回undefined
   * @param opts
   * @return {*}
   */
  async function openCategoryModal(_opts: {
    data: CategoryCompleteResponse;
  }): Promise<CategoryCompleteResponse | undefined> {
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
        height: 360,
        okText: $t('sys.okText'),
        showFooter: true,
      },
    );
    if (res?.ok) {
      return res?.data![0] as CategoryCompleteResponse;
    }
  }

  /**
   * 创建分类
   */
  async function createCategory(data: { parentId?: string } = {}): Promise<{ parentId?: string }> {
    const res = await openCategoryModal({ data });
    let id;
    if (res) {
      res.module = opts.module;
      // postCategory({ name: data.name, module: siderTab.value })
      id = await postCategory(res);
      await load();
    }
    return { parentId: res?.parentId, id };
  }

  /**
   * 加载数据（刷新也是）
   * @return {*}
   */
  async function load(): Promise<void> {
    const data = isFormDesign
      ? (await getInterfaceApi.getCategoryList({ moduleType: opts.module })) || []
      : (await getCategoryListComplete({ module: opts.module })) || [];
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
  async function editCategory(node): Promise<void> {
    // const data = getCategoryById(id)!;
    const data = { name: node.name || node.title, id: node.key || node.id };
    const res = await openCategoryModal({ data });
    if (res) {
      await putCategoryById({ id: data.id ?? '' }, { ...res, module: opts.module });
      await load();
    }
  }

  /**
   * 删除分类
   * 删除成功返回true
   * 取消或者删除失败返回false
   */
  async function deleteCategoryAPI(node, customDelFunc?, customDelTips?: string): Promise<boolean> {
    // const data = getCategoryById(id)!;
    return new Promise((resolve) => {
      Modal.confirm({
        title: $t('sys.sureToDeleteCategoryWithName', { name: `${node.name || node.title}` }),
        icon: createVNode(ExclamationCircleOutlined),
        content: customDelTips || '',
        // content: $t('sys.onlineForm.deleteCategoryTips', {
        //   sth: CategoryModuleEnum.ONLINE_FORM === opts.module ? $t('sys.expression.form') : 'eDHR',
        // }),
        okText: $t('sys.okText'),
        cancelText: $t('sys.cancel'),
        async onOk() {
          try {
            if (customDelFunc) {
              await customDelFunc({ id: node.key || node.id });
            } else {
              await deleteCategory({ ids: node.key || node.id });
            }
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
    await postCategoryDrag(data);
    await load();
  }

  return {
    categoryTreeData,
    createCategory,
    load,
    editCategory,
    deleteCategoryAPI,
    getCategoryById,
    dragCategory,
    isFormDesign,
  };
}

export const useCategory = cacheFnReturn(_useCategory);
