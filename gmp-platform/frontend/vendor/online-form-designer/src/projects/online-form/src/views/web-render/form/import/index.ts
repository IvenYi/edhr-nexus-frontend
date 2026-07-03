import FormImportModal from './form-import-modal.vue';

/**
 * 打开导入弹窗
 * @export
 * @param [categoryKey]
 * @return {*}
 */
export function openImportModal(categoryKey?: string) {
  return gct.openUtil.modal<{
    ok: boolean;
  }>(FormImportModal, {
    categoryKey,
  });
}
