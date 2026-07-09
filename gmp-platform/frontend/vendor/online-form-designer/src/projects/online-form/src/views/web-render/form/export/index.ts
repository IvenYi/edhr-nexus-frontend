import FormExportModal from './form-export-modal.vue';

export enum ExportType {
  TEMPLATE = 'template',
  CATEGORY = 'category',
}

/**
 * 打开导出弹窗
 * @export
 * @param [categoryKey]
 * @return {*}
 */
export function openExportModal() {
  return gct.openUtil.modal(FormExportModal, {});
}
