import { createVNode, render, VNode } from 'vue';
import DocumentMessage from '../components/document-message.vue';

/**
 * 支持的消息类型
 */
export type MessageType = 'info' | 'success' | 'warning' | 'error';

/**
 * 传入参数，可直接传字符串或对象
 */
export interface MessageOptions {
  content: string;
  type?: MessageType;
  duration?: number; // 毫秒，0 为不自动关闭
}

type MessageParams = string | MessageOptions;

/**
 * 消息实例句柄
 */
export interface MessageInstance {
  close: () => void;
}

interface InternalInstance {
  id: string;
  container: HTMLElement;
  vnode: VNode;
}

const globalContainerId = 'nocode-document-message-container';
let globalContainer = document.getElementById(globalContainerId);
if (!globalContainer) {
  globalContainer = document.createElement('div');
  globalContainer.id = globalContainerId;
  document.body.appendChild(globalContainer);
}

let seed = 0;
const instances: InternalInstance[] = [];

/**
 * 创建并显示一条消息
 * @param opts 配置项或文本
 */
function createMessage(opts: MessageOptions): MessageInstance {
  const { content, type = 'info', duration = 3000 } = opts;
  const id = `nocode_msg_${seed++}`;

  const container = document.createElement('div');
  container.id = id;
  globalContainer!.appendChild(container);

  const vnode = createVNode(DocumentMessage, {
    id,
    content,
    type,
    duration,
    onDestroy: destroyMessage,
  });

  render(vnode, container);

  instances.push({ id, container, vnode });

  return {
    close: () => {
      const comp = vnode.component;
      if (comp && comp.proxy && typeof comp.proxy.close === 'function') {
        comp.proxy.close();
      }
    },
  };
}

/**
 * 卸载并移除对应实例
 * @param id 实例 id
 */
function destroyMessage(id: string): void {
  const idx = instances.findIndex((inst) => inst.id === id);
  if (idx === -1) return;

  const { container } = instances[idx];

  render(null, container);

  if (container.parentNode) {
    container.parentNode.removeChild(container);
  }

  instances.splice(idx, 1);
}

function normalize(opts: MessageParams): MessageOptions {
  if (typeof opts === 'string') {
    return { content: opts };
  }
  return opts;
}

const message = {
  info: (opts: MessageParams): MessageInstance =>
    createMessage({ ...normalize(opts), type: 'info' }),
  success: (opts: MessageParams): MessageInstance =>
    createMessage({ ...normalize(opts), type: 'success' }),
  warning: (opts: MessageParams): MessageInstance =>
    createMessage({ ...normalize(opts), type: 'warning' }),
  error: (opts: MessageParams): MessageInstance =>
    createMessage({ ...normalize(opts), type: 'error' }),
};

export default message;
