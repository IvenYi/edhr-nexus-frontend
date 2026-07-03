import { MobileSingleFormFillModal } from '@gct/nocode-mobile-render';
import { GctPopup } from '@mobile/utils/popup';
import { postOnlineFormInstanceDataCollectionUpdateStatus } from '/@/apis/gct-apaas/MedProFormInstanceController';

interface OpenOnlineFormModalOptions {
  collectionItem: any;
  isViewPage?: boolean;
  showRightBtns?: string[];
  callback?: (btnType: string) => void;
}

/**
 * 打开在线表单填报弹框
 * @param options - 包含 collectionItem 数据和可选回调
 * @param ofInstanceId - 可选的表单实例 ID，优先级高于 collectionItem 中的 ID
 */
export function openOnlineFormModal(options: OpenOnlineFormModalOptions, ofInstanceId?: string) {
  const { collectionItem, isViewPage, showRightBtns, callback } = options;

  GctPopup.open(MobileSingleFormFillModal, {
    popupProps: {
      position: 'center',
    },
    context: {
      selfId: ofInstanceId ?? collectionItem?.online_form_id_ ?? '',
      isViewPage,
      needAutoSave: false,
      showRightBtns,
    },
    onOk: async (payload: { instId: string }, done: Function) => {
      await postOnlineFormInstanceDataCollectionUpdateStatus({
        taskId: collectionItem?.online_form_id_,
      });
      if (callback && typeof callback === 'function') {
        callback(payload as any);
      }
      done?.();
    },
  });
}
