import { openWindow, genUrl } from '/@/utils';
import { usePathQueryStore } from '/@/store/modules/pathQuery';
import { PlatformEnum } from '@gct/nocode-base';
import { isLocalDesignerId } from '/@online-form/views/designer/hooks/local-designer-cache';

async function getBranchId() {
  const { useBranch } = await import('/@/hooks/develop/useBranch');
  return useBranch().branchId;
}

async function getEnvTools() {
  const { useEnv } = await import('/@/hooks/develop/useEnv');
  return useEnv();
}

export async function openPaasOnlineFormUrl({ tid, params, mode, instance, updateStatus, model }) {
  const usePathQuery = usePathQueryStore();
  const branchId = await getBranchId();
  const { isAppProd, isAppSingle, isDevSingleEnv, getEnv } = await getEnvTools();
  const paramsUrl = `&${Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;

  let url = import.meta.env.VITE_PATHNAME_WEB_FORM_RENDER;
  if (isAppProd || (isAppSingle && !isDevSingleEnv)) {
    url = import.meta.env.VITE_PATHNAME_WEB_FORM_RENDER.replace(/\/\{bid\}/, '');
  }

  const env = getEnv();

  const printUrl =
    genUrl(`${location.origin}${url}`, {
      aid: usePathQuery.getAid(),
      bid: branchId.value,
      env,
      tid: tid,
      query: params,
      mode: mode,
      updateStatus,
      model: model || '',
    }) + paramsUrl;

  // 预览打印
  if (mode === 'PreviewPrint') {
    instance?.close();
    await openWindow(printUrl, { target: '_blank' });
  } else if (mode === 'DirectPrinting') {
    // 直接打印
    // const handleBeforePrintEvent = () => {
    //   instance?.close();
    // };
    // instance?.open();
    // const iframe = document.createElement('iframe');
    // iframe.src = printUrl;
    // iframe.style.display = 'block';
    // iframe.style.width = '100%';
    // iframe.style.height = '0px';
    // iframe.frameBorder = '0';
    // iframe.id = 'print-iframe';
    // document.body.appendChild(iframe);
    // // 添加事件监听器
    // iframe.contentWindow.addEventListener('beforeprint', handleBeforePrintEvent);
    // // iframe.contentWindow.removeEventListener('afterprint', handleBeforePrintEvent);
  }
}

/**
 * 跳转模拟填报页面
 * @param param.tid 单据模板id
 * @param param.platformType 平台参数类型
 */
export async function openMockReportUrl({
  tid,
  mid,
  platformType,
  url = import.meta.env.VITE_PATHNAME_WEB_FORM_RENDER_MOCK_PAAS,
}) {
  let mockUrl;
  const params = {};

  if (isLocalDesignerId(tid)) {
    openWindow(
      genUrl(`${location.origin}${location.pathname}#/render/render-mock-apaas`, {
        tid,
        mid,
        local: '1',
      }),
      { target: '_blank' },
    );
    return;
  }

  if (platformType === PlatformEnum.INTEGRATION_PAAS_SI) {
    // web 前台 aid bid web
    // web-render 设计端前台 aid bid web-render
    // web-single 单应用前台 aid  web-single
    // dev-single 单应用前台  aid  bid需要自己拿 dev-single
    // test-single 单应用前台 aid test-single

    const { isAppSingle, isAppPreview, getEnv } = await getEnvTools();
    const env = getEnv();

    console.log('0506 0506', env);

    // 单应用场景
    if (isAppSingle) {
      const pathMap = {
        test: 'test-single',
        prod: 'web-single',
        dev: 'dev-single',
      };
      mockUrl = url.replace(/\{path\}/, pathMap[env]).replace(/\/\{bid\}/, '');
    } else if (isAppPreview) {
      mockUrl = url.replace(/\{path\}/, 'web-render');
    } else {
      mockUrl = url.replace(/\{path\}/, 'web').replace(/\/\{bid\}/, '');
    }

    // if (/\/web\//.test(location.pathname)) {
    //   mockUrl = url.replace(
    //     /\{path\}/,
    //     'web',
    //   ).replace(/\/\{bid\}/, '');
    // } else if (/\/web-single\//.test(location.pathname)) {
    //   mockUrl = url.replace(
    //     /\{path\}/,
    //     'web-single',
    //   ).replace(/\/\{bid\}/, '');
    // } else {
    //   mockUrl = url.replace(
    //     /\{path\}/,
    //     'web-render',
    //   );
    // }

    console.log('mockUrl', mockUrl);

    const usePathQuery = usePathQueryStore();
    const branchId = await getBranchId();

    Object.assign(params, {
      aid: usePathQuery.getAid(),
      bid: branchId.value,
      env,
    });
  }
  openWindow(
    genUrl(`${location.origin}${mockUrl}`, {
      ...params,
      tid: tid,
      mid: mid,
    }),
    { target: '_blank' },
  );
}
