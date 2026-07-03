import { createApp, createVNode, render } from 'vue';
import PasswordModal from './password-modal.vue';
import { registerGlobComp } from '/@/components/registerGlobComp';

let container = null;
export function usePasswordModal() {
  let modalRef: any;
  if (!container) {
    container = document.createDocumentFragment() as any;
  }
  async function open(userLastPwdInfo) {
    const ins = createVNode(PasswordModal, {});
    // render(ins, container!);
    const app = createApp(ins);
    //引入国际化和vxetable
    registerGlobComp(app);
    modalRef = app.mount(container!);
    const data = await modalRef.open(userLastPwdInfo);
    return data;
  }

  return { open };
}
