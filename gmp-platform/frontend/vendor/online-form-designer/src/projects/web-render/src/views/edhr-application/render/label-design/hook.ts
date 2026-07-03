import LabelPreviewModal from './label-preview-modal.vue';

export async function openLablePreviewModal({ id }) {
  await gct.openUtil.drawer(
    LabelPreviewModal,
    {
      id,
    },
    {
      title: $t('sys.edhr.viewLabelTemplate'),
      width: 800,
      showFooter: false,
    },
  );
}
