import { ref } from 'vue';
import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
import { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';
import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';

const webPages = ref<CategoryCompleteResponse[]>([]);
const mobilePages = ref<CategoryCompleteResponse[]>([]);

export function usePages() {
  async function loadPages() {
    if (webPages.value.length === 0) {
      getCategoryListComplete({
        module: PageTypeEnum.WEB,
      }).then((res) => {
        webPages.value = res!;
      });
    }
    if (mobilePages.value.length === 0) {
      getCategoryListComplete({
        module: PageTypeEnum.MOBILE,
      }).then((res) => {
        mobilePages.value = res!;
      });
    }
  }

  return {
    loadPages,
    webPages,
    mobilePages,
  };
}
