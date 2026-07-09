import { ref } from 'vue';
import { LowCodeModal } from '../types/modal-types';
import {
  deleteAppGlobalSettings,
  getAppGlobalSettingsInfo,
  getAppGlobalSettingsList,
  postAppGlobalSettings,
  putAppGlobalSettingsById,
} from '/@/apis/gct-apaas/AppGlobalSettingsController';
import { GLOBAL_TYPE } from '../enum';
import { GlobalVar } from '../types/panel';
import { Platform } from '/@page-designer/enum';
import { useQueryStore } from '/@/store/modules/query';
// import { useRoute } from 'vue-router';

// const route = useRoute();
/**全局变量 */
const gVar = ref<{ id: string; key: string; varInfo: GlobalVar }[]>([]);
/**全局弹框 */
const gModal = ref<{ id: string; key: string; name: string; modalInfo: LowCodeModal.Modal }[]>([]);
/**全局事件 */
const gEvent = ref<{ id: string; key: 'pageMounted' | 'pageDestroyed'; eventInfo: string }[]>([]);
const queryStore = useQueryStore();

export function useGlobal() {
  const platform = ((queryStore.query as any).platform as Platform) || Platform.WEB;
  async function queryGModal(fullInfo: boolean = false) {
    const data = await getAppGlobalSettingsList({
      type: GLOBAL_TYPE.MODAL,
      fullInfo,
      source: platform,
    });
    gModal.value =
      data?.map((modal) => {
        return {
          id: modal.id!,
          name: modal.name!,
          key: modal.key!,
          modalInfo: modal.configJson ? JSON.parse(modal.configJson) : null,
        };
      }) || [];
  }
  async function queryGVar(fullInfo: boolean = true) {
    const data = await getAppGlobalSettingsList({
      type: GLOBAL_TYPE.VAR,
      fullInfo,
      source: platform,
    });
    gVar.value =
      data?.map((variable) => {
        return {
          id: variable.id!,
          key: variable.key!,
          varInfo: variable.configJson ? JSON.parse(variable.configJson) : null,
        };
      }) || [];
  }
  async function queryGEvent(fullInfo: boolean = false) {
    const data = await getAppGlobalSettingsList({ type: GLOBAL_TYPE.EVENT, fullInfo });
    gEvent.value =
      data?.map((event) => {
        return {
          id: event.id!,
          key: event.key as 'pageMounted' | 'pageDestroyed',
          eventInfo: event.configJson || '',
        };
      }) || [];
  }
  async function queryInfo(ids) {
    const data = await getAppGlobalSettingsInfo({ ids, fullInfo: true });
    return data;
  }
  async function updateInfo(id, data) {
    await putAppGlobalSettingsById({ id }, data);
  }
  async function addInfo(data) {
    await postAppGlobalSettings(data);
  }
  async function deleteInfo(ids) {
    await deleteAppGlobalSettings({ ids });
  }
  return {
    queryInfo,
    updateInfo,
    addInfo,
    deleteInfo,
    queryGModal,
    queryGVar,
    queryGEvent,
    gVar,
    gModal,
    gEvent,
  };
}
