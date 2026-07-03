import { ref } from 'vue';
import { isEmpty } from 'lodash-es';
// import { getLabelInfo } from '/@/apis/gct-apaas/LabelController';
import { useRoute } from 'vue-router';
import { mmConvertPx } from '/@/utils/unitConversion';
import { LabelLogResponse, LabelResponse } from '/@/apis/gct-apaas/model';
import { getLabelLogInfo, getLabelLogPageList } from '/@/apis/gct-apaas/LabelLogController';
import { sizeOpt } from '../../constants/size';

export interface ProjectType {
  /**尺寸类型 */
  labelSize?: ArrayType<typeof sizeOpt>['value'];
  id: string;
  labelWidth: number;
  labelHeight: number;
  height: string;
  width: string;
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
}

const project = ref<ProjectType>({
  labelWidth: 0,
  labelHeight: 0,
  height: '',
  width: '',
  id: '',
  key: '',
  page: [],
  projectName: '',
  styles: { position: 'relative', margin: 'auto', background: '#fff' },
  printType: 'zpl',
});
const w = ref(0);
const h = ref(0);
//页面历史
const pageDesignHistoryList = ref<LabelLogResponse[]>([]);
export const labelInfo = ref<LabelResponse>();
export function usePage() {
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
    const res: any = await getLabelLogPageList({
      labelKey: labelInfo.value?.key,
      pageNo: 1,
      pageSize: 50,
    });
    if (res) {
      pageDesignHistoryList.value = res.data;
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
    loadLabelDesignHistoryList,
    loadLabelDesignHistoryInfo,
    recover,
    pageDesignHistoryList,
  };
}
export async function loadLabelInfo(id?) {
  const route = useRoute();
  const labelId = id || route?.params?.id;
  if (!labelId) return;
  const { loadLabelDesignHistoryList } = usePage();
  // labelInfo.value = await getLabelInfo({ id: labelId });
  labelInfo.value = {};
  w.value = parseInt(mmConvertPx(labelInfo.value?.width, labelInfo.value?.dpi));
  h.value = parseInt(mmConvertPx(labelInfo.value?.height, labelInfo.value?.dpi));
  if (isEmpty(labelInfo.value?.designerJson)) {
    project.value = newProject(
      labelInfo.value?.id,
      labelInfo.value?.name,
      labelInfo.value?.key,
      w.value,
      h.value,
      labelInfo.value?.modelKey,
      labelInfo.value?.printType,
    );
  } else {
    project.value = JSON.parse(labelInfo.value?.designerJson || '');
    project.value.height = h.value;
    project.value.width = w.value;
  }
  loadLabelDesignHistoryList();
}

function newProject(
  projectId,
  projectName = 'Print Project',
  projectKey,
  width,
  height,
  modelKey?: string,
  printType?: string,
) {
  return {
    id: projectId,
    projectName,
    key: projectKey,
    width: width,
    height: height,
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
