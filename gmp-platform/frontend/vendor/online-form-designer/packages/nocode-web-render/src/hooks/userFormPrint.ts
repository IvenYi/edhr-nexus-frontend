import { message } from 'ant-design-vue';
import { postFileTaskSubmit } from '/@/apis/gct-apaas/FileTaskController';
import { getFileTaskInfo } from '/@/apis/gct-platform/FileTaskController';
import { postMedproFileUnzip } from '/@/apis/gct-apaas/FileController';

export enum PrintModeEnum {
  ASYNC = 'async',
  SYNC = 'sync',
}

export enum FileModeEnum {
  ZIP = 'zip',
  UN_ZIP = 'unZip',
}

const printPolling = useSingletonPolling<{ message: string; url: string; appId: string }>();
/**表单打印 */
export async function formPrint(
  tmplInstantId: string,
  printConfig?: {
    apiMode: PrintModeEnum;
    fileMode: FileModeEnum;
  },
) {
  const key = await postFileTaskSubmit({
    tmplInstantId,
    type: 'FORM',
  });
  if (!key) return;
  const hide = message.loading('打印中...', 0);
  printPolling
    .start((signal) => pollPrintStatus(key, signal))
    .then(async (content) => {
      hide();
      message.success(content.message);
      const url = `/minio/${content.appId}/${content.url}`;

      switch (printConfig?.fileMode) {
        case FileModeEnum.ZIP:
          downloadByUrl({ url });
          break;
        case FileModeEnum.UN_ZIP:
          await unzipUrl({ url: `/${content.url}`, appId: content.appId });
          break;
        default:
          downloadByUrl({ url });
          break;
      }
    })
    .catch((err) => {
      hide();
      if (err?.name === 'AbortError') return;
      message.error(err.message);
    });
}

async function pollPrintStatus(id: string, signal?: AbortSignal) {
  let retry = 0;
  while (retry < 100) {
    if (signal?.aborted) {
      throw new DOMException('轮询已中断', 'AbortError');
    }
    const { status, url, appId } = (await getFileTaskInfo({ id })) || {};
    if (status === 'SUCCEED' && url && appId) {
      return { message: '打印成功', url, appId };
    }

    if (status === 'FAIL') {
      throw new Error('打印失败');
    }
    retry++;
    await sleep(3000, signal);
  }
  throw new Error('打印超时');
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        },
        { once: true },
      );
    }
  });
}

type PollingTask<T> = (signal: AbortSignal) => Promise<T>;

function useSingletonPolling<T>() {
  let controller: AbortController | null = null;

  async function start(task: PollingTask<T>): Promise<T> {
    if (controller) {
      controller.abort();
    }

    const currentController = new AbortController();
    controller = currentController;

    try {
      return await task(currentController.signal);
    } finally {
      // 只清理属于自己的 controller
      if (controller === currentController) {
        controller = null;
      }
    }
  }

  function stop() {
    if (controller) {
      controller.abort();
      controller = null;
    }
  }

  return { start, stop };
}

function downloadByUrl({
  url,
  target = '_blank',
  fileName,
}: {
  url: string;
  target?: string;
  fileName?: string;
}): boolean {
  const isChrome = window.navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  const isSafari = window.navigator.userAgent.toLowerCase().indexOf('safari') > -1;

  if (/(iP)/g.test(window.navigator.userAgent)) {
    console.error('Your browser does not support download!');
    return false;
  }
  if (isChrome || isSafari) {
    const link = document.createElement('a');
    link.href = url;
    link.target = target;

    if (link.download !== undefined) {
      link.download = fileName || url.substring(url.lastIndexOf('/') + 1, url.length);
    }

    if (document.createEvent) {
      const e = document.createEvent('MouseEvents');
      e.initEvent('click', true, true);
      link.dispatchEvent(e);
      return true;
    }
  }
  if (url.indexOf('?') === -1) {
    url += '?download';
  }
  window.open(url, target);
  return true;
}

async function unzipUrl({ url, appId }) {
  const unzipUrl = await postMedproFileUnzip({ url }, { url });
  const path = /^https?:\/\//.test(unzipUrl)
    ? unzipUrl
    : /^\/w/.test(unzipUrl!)
      ? `${import.meta.env.VITE_MINIO_PATH}/${appId}/${unzipUrl}`
      : `${import.meta.env.VITE_MINIO_PATH}/${appId}/${unzipUrl}`;
  console.log('unzipUrl', unzipUrl);

  const newWindow = window.open(`${path}`, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
}
