import SelectTmplModal from './components/select-tmpl-modal.vue';
import { genUrl, openWindow } from '/@/utils';
import { useBranch } from '/@/hooks/develop/useBranch';
import { usePathQueryStore } from '/@/store/modules/pathQuery';
import { useEnv } from '/@/hooks/develop/useEnv';
import ViewTmplModal from './components/view-tmpl-modal.vue';

interface PARAMS {
  onClosed?: Function;
}
export async function openSelectTmplModal(params?: PARAMS) {
  const { onClosed } = params || {};
  const res: any = await gct.openUtil.modal(
    SelectTmplModal,
    {},
    {
      title: $t('sys.edhr.selectCirculationFormTmpl'),
      width: 640,
      okText: $t('sys.okText'),
    },
  );
  if (res.ok) {
    if (onClosed) onClosed(res.data);
  }
}

export async function openTmplDesignPage(params: { id: string; model?: boolean }) {
  const { branchId } = useBranch();
  const usePathQuery = usePathQueryStore();
  const { getEnv } = useEnv();

  openWindow(
    genUrl(`${location.origin}${import.meta.env.VITE_PATHNAME_WEB_FORM_DESIGNER}`, {
      aid: usePathQuery.getAid(),
      bid: branchId.value,
      id: params.id,
      env: getEnv(),
      model: params.model,
    }),
    {
      target: '_blank',
    },
  );
}

export function onViewTmpl(record) {
  gct.openUtil.drawer(
    ViewTmplModal,
    {
      id: record.id,
    },
    {
      title: $t('sys.edhr.viewTemplate'),
      showFooter: false,
      width: 900,
      class: 'gct-view-tmpl-modal',
    },
  );
}
