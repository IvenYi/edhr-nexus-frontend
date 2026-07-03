import { ref, watch, computed, onUnmounted } from 'vue';
import { cloneDeep, isEmpty } from 'lodash-es';
import { commonUtils } from '@gct/nocode-base';
import type { IWikiTreeData } from '@gct/nocode-base';
import { getDocOutlineListByInstance } from '/@/apis/gct-apaas/DocOutlineController';
import { getOnlineFormInstanceFindByTmplIdAndMaterialNo } from '/@/apis/gct-apaas/OnlineFormInstanceController';
import { getMedproEdhrAttachmentGetEdhrAttachment } from '/@/apis/gct-apaas/EdhrAttachmentController';

import { EdhrInstance, OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';

interface IProps {
  /** edhr 实例id */
  selfId?: string;
  /** 物料编号/或批次id */
  materialNo?: string;
}

interface IPayload {}

export function useNewSiWikiFactory(props: IProps, payload: IPayload) {
  /** 页面加载状态 */
  const loading = ref(false);
  /** wiki大纲 */
  const treeData = ref<Array<IWikiTreeData>>([]);
  /** edhr实例 */
  const edhrInstance = ref<EdhrInstance>();
  /** 选择的表单信息 */
  const treeSelectDocData = ref<any>();
  /** 在线表单实例列表 */
  const docInstanceList = ref<Array<OnlineFormInstanceResponse>>([]);
  /** 选择的表单模板id */
  const selectTid = ref();
  /** 附录列表 */
  const appendixList = ref<any[]>();

  /** 选择的实例信息 */
  const selectSelfInfo = ref<any>();

  const edhrCounter = ref(0);
  const edhrFinisher = ref(0);
  const instanceCounter = ref(0);

  watch(
    [() => props.selfId, () => edhrCounter.value],
    async ([newSelfId, _]) => {
      if (isEmpty(newSelfId)) return;
      loading.value = true;
      clear(); // 清空之前的结果

      try {
        const appendixRes = await getMedproEdhrAttachmentGetEdhrAttachment({
          materialNo: props.materialNo!,
        });

        console.log('附录列表=====>', appendixRes);
        appendixList.value = appendixRes;
        const wikiList = await getDocOutlineListByInstance({ id: newSelfId });

        console.log('wiki大纲', wikiList);
        if (wikiList && wikiList.length !== 0) {
          const tree = commonUtils.listTransformTree(wikiList);
          treeData.value = tree;
          treeSelectDocData.value = commonUtils.findFirstDoc(tree);
        }
      } catch (error) {
        console.error('请求失败:', error);
      } finally {
        loading.value = false;
        edhrFinisher.value++;
      }
    },
    { immediate: true, deep: true },
  );

  watch(
    [() => treeSelectDocData.value, () => instanceCounter.value],
    async ([newTreeSelectDocData, _]) => {
      if (newTreeSelectDocData) {
        const tid =
          newTreeSelectDocData.tmplId || newTreeSelectDocData.refId || newTreeSelectDocData.id;

        const res = await getOnlineFormInstanceFindByTmplIdAndMaterialNo({
          materialNo: props.materialNo!,
          ofTmplId: tid, // 在线表单模板id
        });

        docInstanceList.value = res?.ofInstances ?? [];
        edhrInstance.value = res?.edhrInstance ?? {};
        selectTid.value = tid;
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  watch(
    () => docInstanceList.value,
    (newDocInstanceList) => {
      if (newDocInstanceList && newDocInstanceList.length !== 0) {
        if (!selectSelfInfo.value) {
          selectSelfInfo.value = newDocInstanceList?.[0];
        }
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const hasData = computed(() => {
    return treeData.value.length !== 0;
  });

  const usePermissionActions = computed(() => {
    // Base actions
    const baseActions = {
      Annotate: true, // 变更记录按钮权限控制
      Cancel: false, // 表单作废 重新提交按钮权限控制
      Update: true, // 表单变更按钮权限控制
    };

    return baseActions;
  });

  function clear() {
    treeData.value = [];
    docInstanceList.value = [];
    edhrInstance.value = {};
    treeSelectDocData.value = undefined;
    selectSelfInfo.value = undefined;
    selectTid.value = undefined;
  }

  async function reload() {
    const { tmplId, refId, id } = treeSelectDocData.value;
    const tid = tmplId || refId || id;

    const res = await getOnlineFormInstanceFindByTmplIdAndMaterialNo({
      materialNo: props.materialNo!,
      ofTmplId: tid, // 在线表单模板id
    });

    docInstanceList.value = res?.ofInstances ?? [];
    edhrInstance.value = res?.edhrInstance ?? {};
    selectTid.value = tid;
  }

  return {
    loading,
    hasData,
    treeData,
    appendixList,
    edhrInstance,
    docInstanceList,
    treeSelectDocData,
    selectSelfInfo,
    selectTid,
    usePermissionActions,
    reload,
  };
}
