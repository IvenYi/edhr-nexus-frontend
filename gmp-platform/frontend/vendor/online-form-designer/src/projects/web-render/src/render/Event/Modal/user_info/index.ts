import template from './use-info-modal.vue';

export const usageInformation = ({ modelKey, id, row }) => {
  if (!id) return;
  console.log('usageInformation', modelKey, id, row);
  gct.openUtil.modal(
    template,
    { modelKey, id, row },
    { title: $t('sys.pageDesigner.useinfo'), width: 800, showFooter: false },
  );
};
