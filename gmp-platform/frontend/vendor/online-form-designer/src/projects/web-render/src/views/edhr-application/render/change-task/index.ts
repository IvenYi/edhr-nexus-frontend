import DetailModal from './modals/detail.vue'
export async  function openDetailModal(options: { businessId: string, }) {
  await gct.openUtil.drawer(DetailModal,
    {
      businessId: options.businessId,
    },
    {
      width: 1000,
      title: '详情',
      showFooter: false,
      class: 'gct-view-tmpl-modal',
    }
  )
}