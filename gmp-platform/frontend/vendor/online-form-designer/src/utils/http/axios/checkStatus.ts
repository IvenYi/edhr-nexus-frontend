import type { ErrorMessageMode } from '/#/axios';
import { useMessage } from '/@/hooks/web/useMessage';
import { useI18n } from '/@/hooks/web/useI18n';
// import { PageEnum } from '/@/enums/pageEnum';
import projectSetting from '/@/settings/projectSetting';
import { useEnv } from '/@/hooks/develop/useEnv';

const SessionTimeoutProcessingEnum = {
  ROUTE_JUMP: 0,
  PAGE_COVERAGE: 1,
} as const;

const { createMessage, createErrorModal } = useMessage();
const error = createMessage.error!;
const stp = projectSetting.sessionTimeoutProcessing;
const { isSandbox } = useEnv();

async function handleUnauthorized() {
  const { useUserStoreWithOut } = await import('/@/store/modules/user');
  const userStore = useUserStoreWithOut();
  userStore.setToken(undefined);
  if (stp === SessionTimeoutProcessingEnum.PAGE_COVERAGE) {
    userStore.setSessionTimeout(true);
  } else {
    userStore.logout(true);
  }
}

export function checkStatus(
  status: number,
  msg: string,
  errorMessageMode: ErrorMessageMode = 'message',
): void {
  const { t } = useI18n();
  let errMessage = '';

  switch (status) {
    case 400:
      errMessage = `${msg}`;
      break;
    // 401: Not logged in
    // Jump to the login page if not logged in, and carry the path of the current page
    // Return to the current page after successful login. This step needs to be operated on the login page.
    case 401:
      errMessage = msg || t('sys.errMsg401');
      handleUnauthorized();
      break;
    case 403:
      errMessage = t('sys.errMsg403');
      break;
    // 404请求不存在
    case 404:
      errMessage = t('sys.errMsg404');
      break;
    case 405:
      errMessage = t('sys.errMsg405');
      break;
    case 408:
      errMessage = t('sys.errMsg408');
      break;
    case 500:
      errMessage = t('sys.errMsg500');
      break;
    case 501:
      errMessage = t('sys.errMsg501');
      break;
    case 502:
      errMessage = t('sys.errMsg502');
      break;
    case 503:
      errMessage = t('sys.errMsg503');
      break;
    case 504:
      errMessage = t('sys.errMsg504');
      break;
    case 505:
      errMessage = t('sys.errMsg505');
      break;
    case 510:
      if (isSandbox) {
        window.location.replace(`${location.origin}${location.pathname}#/notFound`);
        // window.location.href = `${location.origin}${location.pathname}#/notFound`;
        // setTimeout(() => {
        //   window.location.reload();
        // }, 1000);
      }
      break;
    default:
  }

  if (errMessage) {
    if (errorMessageMode === 'modal') {
      createErrorModal({ title: t('sys.errorTip'), content: errMessage });
    } else if (errorMessageMode === 'message') {
      error({ content: errMessage, key: `global_error_message_status_${status}` });
    }
  }
}
