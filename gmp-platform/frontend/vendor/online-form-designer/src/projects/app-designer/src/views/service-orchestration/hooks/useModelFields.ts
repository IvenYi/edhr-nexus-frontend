import { ref } from 'vue';

import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
import { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';

const categoryModels = ref<CategoryCompleteResponse[]>([]);
const modelFieldsMap = {};

export function useModelFields() {
  async function loadModels() {
    const res = await getCategoryListComplete({
      module: ModelTypeEnum.ENTITY,
    });
    categoryModels.value = res?.filter((c) => c.children && c.children.length > 0)!;
  }

  async function loadFields(modelKey: string) {
    const res = await getFieldMetaList({
      modelKey,
      sys: false,
    });
    modelFieldsMap[modelKey] = res;
    return res;
  }

  async function getModelFields(modelKey: string) {
    if (modelFieldsMap[modelKey]) {
      return modelFieldsMap[modelKey];
    } else {
      const res = loadFields(modelKey);
      return res;
    }
  }

  return {
    categoryModels,
    loadModels,
    loadFields,
    getModelFields,
  };
}
