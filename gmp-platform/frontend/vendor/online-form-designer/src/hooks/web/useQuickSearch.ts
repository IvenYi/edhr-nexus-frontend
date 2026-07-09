import { QuickSearchEnum } from '@gct/runtime';
import {
  ModelTypeEnum,
  PageTypeEnum,
  PrintTypeEnum,
  ScriptTypeEnum,
} from '/@/layouts/tree-sider-page-new/enum';
import { useRoute, useRouter } from 'vue-router';

let searchEventCallback;
/**
 * 快速搜索功能模块
 */
export function useSearchEvent() {
  const router = useRouter();
  const route = useRoute();
  async function quickSearchEvent(
    type: QuickSearchEnum,
    key: string,
    searchName: string,
    categoryId: string,
  ) {
    const { name, module } = goRouterMeta[type];
    if (route.name !== name) {
      const searchStr = JSON.stringify({
        module,
        key,
        searchName,
        categoryId,
      });
      await router.push({ name, query: { searchStr: encodeURI(searchStr) } });
    } else {
      searchEventCallback && searchEventCallback({ module, key, searchName, categoryId });
    }
  }
  return { quickSearchEvent };
}

export function useQuickNext(callback: Function, onMounted?: Function) {
  searchEventCallback = callback;
  const route = useRoute();
  const searchStr = route.query.searchStr as string;
  if (searchStr) {
    const { module, key, searchName, categoryId } = JSON.parse(decodeURI(searchStr));
    callback({ module, key, searchName, categoryId });
  } else {
    onMounted && onMounted();
  }
}
// /**
//  * 移除无效的url
//  * @param paramName
//  */
// function removeSpecificQueryParam(paramName) {
//   const currentUrl = window.location.href;
//   const url = new URL(currentUrl);
//   url.searchParams.delete(paramName);
//   console.log()
//   history.replaceState(null, '', url.toString());
// }
type RouterMeta = {
  [key in QuickSearchEnum]: {
    name: string;
    module?: ModelTypeEnum | PageTypeEnum | PrintTypeEnum | ScriptTypeEnum;
    key?: string;
  };
};
const goRouterMeta: RouterMeta = {
  [QuickSearchEnum.MODEL_ENITY]: {
    name: 'ModelDesigner',
    module: ModelTypeEnum.ENTITY,
  },
  [QuickSearchEnum.MODEL_ENUM]: {
    name: 'ModelDesigner',
    module: ModelTypeEnum.ENUM,
  },
  [QuickSearchEnum.MODEL_VIEW]: {
    name: 'ModelDesigner',
    module: ModelTypeEnum.VIEW,
  },
  [QuickSearchEnum.MODEL_DATA]: {
    name: 'ModelDesigner',
    module: ModelTypeEnum.DATA,
  },
  [QuickSearchEnum.WEB_PAGE]: {
    name: 'PageDesigner',
    module: PageTypeEnum.WEB,
  },
  [QuickSearchEnum.MOBILE_PAGE]: {
    name: 'PageDesigner',
    module: PageTypeEnum.MOBILE,
  },
  [QuickSearchEnum.PAD_PAGE]: {
    name: 'PageDesigner',
    module: PageTypeEnum.PAD,
  },
  [QuickSearchEnum.LABLE_PRINT]: {
    name: 'PrintDesign',
    module: PrintTypeEnum.LABEL,
  },
  [QuickSearchEnum.DOCUMENT_PRINT]: {
    name: 'PrintDesign',
    module: PrintTypeEnum.RECEIPT,
  },
  [QuickSearchEnum.PROCESS_DESIGNER]: {
    name: 'Process',
  },
  [QuickSearchEnum.DEV_SCRIPT]: {
    name: 'LogicDevelop',
    module: ScriptTypeEnum.DEFAULT,
  },
  [QuickSearchEnum.DEV_LOGIC]: {
    name: 'LogicDevelop',
    module: ScriptTypeEnum.ORCHESTRATION,
  },
  [QuickSearchEnum.DEV_METHOD]: {
    name: 'LogicDevelop',
    module: ScriptTypeEnum.GLOBAL_METHOD,
  },
};
