import { ICodeList } from '@gct/runtime';
import { i18n } from '/@/locales/setupI18n';

const { t } = i18n.global;

/**
 * 触发类型
 */
export const triggerPolicy: ICodeList = {
  tag: 'triggerPolicy',
  mode: 'static',
  items: [
    { label: t('sys.webRender.timedTask.code.once'), value: 'ONCE' },
    { label: t('sys.webRender.timedTask.code.repeat'), value: 'REPEAT' },
    { label: t('sys.webRender.timedTask.code.cron'), value: 'CRON' },
  ],
};

/**
 * 触发方式
 */
export const resourceType: ICodeList = {
  tag: 'resourceType',
  mode: 'static',
  items: [
    { label: t('sys.webRender.timedTask.code.script'), value: 'SCRIPT_SERVICE' },
    { label: t('sys.webRender.timedTask.code.orchestration'), value: 'SO_SERVICE' },
  ],
};

/**
 * 状态
 */
export const status: ICodeList = {
  tag: 'status',
  mode: 'static',
  items: [
    { label: t('sys.webRender.timedTask.code.enabled'), value: 'ENABLED' },
    { label: t('sys.webRender.timedTask.code.disabled'), value: 'DISABLED' },
  ],
};
