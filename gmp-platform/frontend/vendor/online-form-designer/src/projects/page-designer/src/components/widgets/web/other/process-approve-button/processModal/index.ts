import processModal from './process-modal.vue';

/**打开流处理模态框 */
export async function openProcessModal({ title, signature, opinion, user }) {
  const res = await gct.openUtil.modal(
    processModal,
    { signature, opinion, user },
    {
      title,
      width: '760px',
    },
  );
  if (res.ok) {
    return Promise.resolve(res.data);
  } else {
    return Promise.reject();
  }
}
