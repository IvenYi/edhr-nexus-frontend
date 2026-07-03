import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export enum TriggerTypeEnum {
  /** 事件 */
  EVENT = 'EVENT',
  WEBHOOK = 'WEBHOOK',
  MQTT = 'MQTT',
}

export const triggerTypeOptions = [
  {
    label: t('sys.appDesigner.events'),
    value: TriggerTypeEnum.EVENT,
  },
];

export const Ch_TriggerType = {
  [TriggerTypeEnum.EVENT]: t('sys.appDesigner.events'),
};
