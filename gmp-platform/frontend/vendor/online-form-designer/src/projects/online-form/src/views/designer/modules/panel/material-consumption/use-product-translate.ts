/** 缓存 */
import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

import { ref } from 'vue';

const labelIdMaps = ref<Record<string, string>>({});

export function useProductTranslate() {
  async function translateName(refId: string) {
    if (labelIdMaps.value[refId]) {
      return labelIdMaps.value[refId];
    }
    const res: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'rdoGetVersionByRefId',
        modelKey: 'em_product',
        modelCategory: 'entity',
      },
      {
        includeDeleted: 1,
        refId,
      },
      {
        refId,
      },
    );
    const label = res?.data?.__SHOW_LABEL__ || '';
    labelIdMaps.value[refId] = label;
    return label;
  }

  return { translateName };
}
