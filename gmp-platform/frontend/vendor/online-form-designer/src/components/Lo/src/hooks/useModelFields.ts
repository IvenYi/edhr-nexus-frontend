import { ref } from 'vue';
import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
import { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
import { getBizServiceCrudList } from '/@/apis/gct-apaas/BizServiceController';
import type { BizServiceResponse } from '/@/apis/gct-apaas/model';

const categoryModels = ref<CategoryCompleteResponse[]>([]);
const modelServicesMap: Record<string, BizServiceResponse[]> = {};
const modelFieldsMap = {};

export function useModelFields() {
  async function loadModels() {
    const res = await getCategoryListComplete({
      module: ModelTypeEnum.ENTITY as string,
    });
    categoryModels.value = res?.filter((c) => c.children && c.children.length > 0) ?? [];
  }

  async function loadFields(modelKey: string) {
    const res = await getFieldMetaList({
      modelKey,
      sys: false,
    });
    modelFieldsMap[modelKey] = res ?? [];
    return res;
  }

  async function getModelFields(modelKey: string) {
    if (modelFieldsMap[modelKey]) {
      return modelFieldsMap[modelKey];
    } else {
      const res = await loadFields(modelKey);
      return res;
    }
  }

  async function loadServices(modelKey: string) {
    const res = await getBizServiceCrudList({
      modelKey,
    });
    modelServicesMap[modelKey] = res ?? [];
    return res;
  }

  async function getModelServices(modelKey: string) {
    if (modelServicesMap[modelKey]) {
      return modelServicesMap[modelKey];
    } else {
      const res = await loadServices(modelKey);
      return res;
    }
  }

  return {
    categoryModels,
    loadModels,
    loadFields,
    getModelFields,
    loadServices,
    getModelServices,
  };
}
