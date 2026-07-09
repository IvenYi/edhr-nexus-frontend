// 分类树接口操作；

import { Modal, message } from 'ant-design-vue';
import { CategoryModuleEnum } from './constant';
import { CategoryCompleteVO, CategoryDragDTO } from '/@/apis/gct-apaas/model';
import { ref } from 'vue';
import { recursiveIterate } from '/@/utils/recursive';
import { CategoryModal } from '../category';
import { cacheFnReturn } from '@gct/runtime';
import {
  deleteFlowCategory,
  getFlowCategoryList,
  postFlowCategory,
  putFlowCategoryById,
  postFlowCategoryDrag,
} from '/@/apis/gct-ipaas2/FlowCategoryController';
import { FlowCategoryResponse } from '/@/apis/gct-ipaas2/model';

function _useCategory(opts: { module: CategoryModuleEnum }) {
  const categoryMap = new Map<string, CategoryCompleteVO>();
  const categoryTreeData = ref<CategoryCompleteVO[]>();

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
    const res = await gct.openUtil.modal<any>(
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
    if (res) {
      res.module = opts.module;
      await postFlowCategory(res);
      await load();
      message.success($t('sys.createSuccess'));
    }
    return { parentId: res?.parentId };
  }

  // 支持自定义配置的增强版
  function buildTreeAdvanced(
    nodes,
    config = {
      idKey: 'id',
      parentKey: 'parentId',
      childrenKey: 'child',
      keepParentKey: true,
    },
  ) {
    const { idKey, parentKey, childrenKey, keepParentKey } = config;
    const nodeMap = new Map<string, any>();
    const childMap = new Map<string, any>();
    const roots: any[] = [];

    nodes.forEach((node) => {
      // 处理节点
      const nodeCopy = { ...node };
      const parentId = node[parentKey];

      if (!keepParentKey) delete nodeCopy[parentKey];
      nodeMap.set(node[idKey], nodeCopy);

      // 处理节点关系
      if (parentId !== 'ROOT') {
        if (!childMap.has(parentId)) {
          childMap.set(parentId, []);
        }
        childMap.get(parentId).push(nodeCopy);
      } else {
        roots.push(nodeCopy);
      }
    });

    // 设置子节点字段
    for (const [id, children] of childMap) {
      const parent = nodeMap.get(id);
      if (parent) {
        parent[childrenKey] = children;
      }
    }

    return roots;
  }

  /**
   * 加载数据（刷新也是）
   * @return {*}
   */
  async function load(): Promise<void> {
    const data = (await getFlowCategoryList({ module: opts.module })) || [];
    categoryTreeData.value = buildTreeAdvanced(data);
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
      await putFlowCategoryById({ id }, res);
      await load();
      message.success($t('sys.developer.appCenter.editSuccess'));
    }
  }

  const deleteConfirmMsg = {
    [CategoryModuleEnum.FLOW]: {
      moduleTitle: $t('sys.ipaas.connectionFlow'),
      content: '注意：删除应用分类，该分类下所有连接流都会被删除。删除后无法恢复。',
    },
    [CategoryModuleEnum.CONNECTOR]: {
      moduleTitle: $t('sys.ipaas.connector'),
      content:
        '注意：删除分类，该分类下所有连接器都会被删除。删除后无法恢复。如果分类下的连接器存在被引用则无法删除',
    },
  };

  /**
   * 删除分类
   * 删除成功返回true
   * 取消或者删除失败返回false
   */
  async function deleteCategory(id: string): Promise<boolean> {
    const data = getCategoryById(id)!;
    const msg = deleteConfirmMsg[opts.module];
    const title = $t('sys.sureToDeleteCategoryWithName', {
      name: `【${data.name}】${msg.moduleTitle}`,
    });

    return new Promise((resolve) => {
      Modal.confirm({
        title: title,
        content: msg.content,
        okText: $t('sys.okText'),
        cancelText: $t('sys.cancel'),
        async onOk() {
          try {
            await deleteFlowCategory({ ids: data.id! });
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
    await postFlowCategoryDrag(data);
    await load();
  }

  return {
    categoryTreeData,
    createCategory,
    load,
    editCategory,
    deleteCategory,
    getCategoryById,
    dragCategory,
  };
}

export const useCategory = cacheFnReturn(_useCategory);
