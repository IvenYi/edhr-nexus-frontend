import { ref, computed } from 'vue';
import { isEmpty } from 'lodash-es';
import { useRoute } from 'vue-router';
import { mmConvertPx } from '/@/utils/unitConversion';
import { LabelLogResponse, LabelResponse } from '/@/apis/gct-apaas/model';
import { getLabelLogInfo, getLabelLogPageList } from '/@/apis/gct-apaas/LabelLogController';
import { sizeOpt } from '../../constants/size';
import { getLabelGetVersionById } from '/@/apis/gct-apaas/LabelController';
import aliasManager from '../helper/aliasManager';

export interface ProjectType {
  /**尺寸类型 */
  labelSize?: ArrayType<typeof sizeOpt>['value'];
  id: string;
  labelWidth: number;
  labelHeight: number;
  height: string;
  width: string;
  heightMM: string;
  widthMM: string;
  key: string;
  page: object[];
  projectName: string;
  styles: {
    position: string;
    margin: string;
    background: string;
  };
  dpi?: number;
  /**模型key */
  modelKey?: string;
  printType?: string;
  isEdit?: Boolean;
}

const project = ref<ProjectType>({
  labelWidth: 0,
  labelHeight: 0,
  height: '',
  width: '',
  heightMM: '',
  widthMM: '',
  id: '',
  key: '',
  page: [],
  projectName: '',
  styles: { position: 'relative', margin: 'auto', background: '#fff' },
  printType: 'zpl',
});
const w = ref(0);
// 宽度毫米
const wM = ref(0);
const h = ref(0);
// 高度毫米
const hM = ref(0);
//页面历史
const pageDesignHistoryList = ref<LabelLogResponse[]>([]);
const pageNo = ref(1);
const noMore = ref(false);
const loading = ref(false);
const isEdhr = ref(false);

export const labelInfo = ref<LabelResponse>();
export function usePage() {
  const route = useRoute();
  isEdhr.value = Boolean(route?.query?.isEdhr);
  /**
   * 获取历史版本信息
   * @param id
   * @returns
   */
  async function loadLabelDesignHistoryInfo(id: string) {
    return getLabelLogInfo({
      id,
    });
  }
  /** 获取历史版本列表 */
  async function loadLabelDesignHistoryList() {
    if (loading.value || noMore.value) return; // 避免重复请求

    loading.value = true;
    try {
      const res: any = await getLabelLogPageList({
        labelKey: labelInfo.value?.key,
        pageNo: pageNo.value ?? 1,
        pageSize: 50,
      });
      if (res) {
        if (pageNo.value === 1) {
          pageDesignHistoryList.value = res.data || [];
        } else {
          pageDesignHistoryList.value = [...pageDesignHistoryList.value, ...(res.data || [])];
        }
        // 判断是否有更多数据
        if (pageDesignHistoryList.value?.length >= res.totalCount) {
          noMore.value = true;
        } else {
          pageNo.value += 1; // 页码+1
        }
      }
    } catch (err) {
      console.error('数据加载失败：', err);
    } finally {
      loading.value = false;
    }
  }
  /** 恢复历史记录 */
  async function recover(id: string) {
    const history = await getLabelLogInfo({ id });
    Object.assign(labelInfo.value!, { designerJson: history?.designerJson });
    if (labelInfo.value) {
      try {
        if (labelInfo.value?.designerJson) {
          project.value = JSON.parse(decodeURIComponent(labelInfo.value?.designerJson));
        }
      } catch (error) {
        if (labelInfo.value?.designerJson) {
          project.value = JSON.parse(labelInfo.value?.designerJson);
        }
      }
    }
  }
  return {
    width: w,
    height: h,
    project,
    loading,
    loadLabelDesignHistoryList,
    loadLabelDesignHistoryInfo,
    recover,
    pageDesignHistoryList,
    isEdhr,
  };
}

export async function loadLabelInfo(id?): Promise<ProjectType | null> {
  const route = useRoute();
  const labelId = id || route?.params?.id;
  if (!labelId) return null;
  const { loadLabelDesignHistoryList } = usePage();
  labelInfo.value = await getLabelGetVersionById({ id: labelId });
  wM.value = labelInfo.value!.width!;
  hM.value = labelInfo.value!.height!;
  w.value = parseInt(mmConvertPx(labelInfo.value?.width, labelInfo.value?.dpi).toString());
  h.value = parseInt(mmConvertPx(labelInfo.value?.height, labelInfo.value?.dpi).toString());
  if (isEmpty(labelInfo.value?.designerJson)) {
    project.value = newProject(
      labelInfo.value?.id,
      labelInfo.value?.name,
      labelInfo.value?.key,
      w.value,
      h.value,
      labelInfo.value?.modelKey,
      labelInfo.value?.printType,
      wM.value,
      hM.value,
    );
  } else {
    project.value = JSON.parse(labelInfo.value?.designerJson || '');
    project.value.height = h.value;
    project.value.width = w.value;
    project.value.heightMM = hM.value;
    project.value.widthMM = wM.value;
  }
  if (project.value && project.value.page) {
    project.value.page.forEach((item) => {
      aliasManager.set(item);
    });
  }
  noMore.value = false;
  pageNo.value = 1;
  await loadLabelDesignHistoryList();
  return project.value;
}

function newProject(
  projectId,
  projectName = 'Print Project',
  projectKey,
  width,
  height,
  modelKey?: string,
  printType?: string,
  widthMM?,
  heightMM?,
) {
  return {
    id: projectId,
    projectName,
    key: projectKey,
    width,
    height,
    widthMM,
    heightMM,
    styles: {
      position: 'relative',
      margin: 'auto',
      background: '#fff',
    },
    page: [],
    modelKey: modelKey,
    printType: printType || 'zpl',
  };
}
