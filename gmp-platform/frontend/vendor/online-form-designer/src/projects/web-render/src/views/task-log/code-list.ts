import { ICodeList } from '@gct/runtime';
import { i18n } from '/@/locales/setupI18n';

const { t } = i18n.global;

/**
 * 触发模式
 */
export const triggerMode: ICodeList = {
  tag: 'triggerMode',
  mode: 'static',
  items: [
    { label: t('sys.webRender.taskLog.code.auto'), value: 'AUTO' },
    { label: t('sys.webRender.taskLog.code.manual'), value: 'MANUAL' },
  ],
};

/**
 * 触发结果
 */
export const triggerResult: ICodeList = {
  tag: 'triggerResult',
  mode: 'static',
  items: [
    { label: t('sys.webRender.taskLog.code.succeed'), value: 'SUCCEED' },
    { label: t('sys.webRender.taskLog.code.failure'), value: 'FAILURE' },
  ],
};
