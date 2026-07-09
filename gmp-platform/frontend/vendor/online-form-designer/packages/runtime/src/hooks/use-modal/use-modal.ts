import { inject } from 'vue';
import { IModal, IModalData } from '../../interface';

/**
 * 获取模态打开时的模态实例
 *
 * @author zhanghanrui
 * @date 2024-04-02 23:04:32
 * @export
 * @return {*}  {IModal}
 */
export function useModal(ok?: () => Promise<IModalData | null>): IModal | undefined {
  const modal = inject<IModal>('modal');
  if (modal) {
    if (ok) {
      modal.ok = ok;
    }
  }
  return modal;
}
