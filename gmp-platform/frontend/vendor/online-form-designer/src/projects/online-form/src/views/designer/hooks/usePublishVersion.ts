import { Ref, ref } from 'vue';
import type { OnlineFormTmplLogResponse, OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';

export interface OnlineFormPublishVersion {
  id: string;
  designerJson: string;
  time: string;
  user: string;
  tmplId: string;
}

/**
 * 单据数据
 */
let doc: Ref<OnlineFormTmplResponse>;
/** 发布的历史数据的前几条 */
const topPublishVersions = ref<Array<OnlineFormPublishVersion>>([]);
/** 当前版本的数据 */
const currentVersion = ref<OnlineFormPublishVersion>();
const LOCAL_FORM_DESIGNER_ID = '__local__';

async function getOnlineFormTmplLogPageList(...args) {
  const controller = await import('/@/apis/gct-apaas/OnlineFormTmplLogController');
  return controller.getOnlineFormTmplLogPageList(...args);
}

export function usePublishVersion() {
  function convert(data: OnlineFormTmplLogResponse[] = []) {
    return data.map((i) => {
      return {
        id: i.id!,
        time: i.createTime!,
        designerJson: i.designerJson!,
        user: i.createUserName!,
        tmplId: i.tmplId!,
      };
    });
  }

  /** 加载前几条发布版本列表 */
  const loadTopPublishVersions = async () => {
    const tmplId = doc.value.id!;
    if (tmplId === LOCAL_FORM_DESIGNER_ID) {
      topPublishVersions.value = [];
      return;
    }
    const res = await getOnlineFormTmplLogPageList({
      tmplId,
      pageNo: 1,
      pageSize: 5,
    });
    topPublishVersions.value = convert(res?.data);
  };

  /** 初始化 */
  function initialize(opts: { doc: Ref<OnlineFormTmplResponse> }) {
    doc = opts.doc;
    // 初始化当前版本
    currentVersion.value = {
      id: doc.value.id!,
      designerJson: doc.value.designerJson!,
      time: doc.value.modifyTime!,
      tmplId: doc.value.id!,
      user: doc.value.modifyUserName!,
    };
    loadTopPublishVersions();
  }

  /** 加载表格数据 */
  const loadTableData = async (params: { pageNo: number; pageSize: number }) => {
    if (doc.value.id === LOCAL_FORM_DESIGNER_ID) {
      return {
        total: 0,
        data: [],
      };
    }
    const res = await getOnlineFormTmplLogPageList({
      tmplId: doc.value.id!,
      ...params,
    });
    return {
      total: res?.totalCount,
      data: convert(res?.data),
    };
  };

  return {
    currentVersion,
    topPublishVersions,
    initialize,
    loadTableData,
  };
}
