import { useI18n } from '/@/hooks/web/useI18n';

import type { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';

const { t } = useI18n();

export const enum EventsEnum {
  /** 自定义 */
  CUSTOM = 'CUSTOM',
  /** 系统内置 */
  SYSTEM = 'SYSTEM',
}

export const enum EventsTypeEnum {
  /** 服务编排 */
  SO_SERVICE = 'SO_SERVICE',
  /** 服务脚本 */
  SCRIPT_SERVICE = 'SCRIPT_SERVICE',
}

export const Ch_Events = {
  [EventsEnum.SYSTEM]: t('sys.appDesigner.sysBuiltIn'),
  [EventsEnum.CUSTOM]: t('sys.appDesigner.appCustom'),
};

export const eventsOptions = [
  {
    label: t('sys.appDesigner.appInitial'),
    value: `${EventsEnum.SYSTEM},INITIAL`,
  },
  {
    label: t('sys.appDesigner.appAfterDeploy'),
    value: `${EventsEnum.SYSTEM},AFTER_DEPLOY`,
  },
  // {
  //   label: t('sys.appDesigner.appCustom'),
  //   value: `${EventsEnum.CUSTOM},custom`,
  // },
];

export const eventsTypeOptions = [
  {
    label: t('sys.model.serviceOrchestration'),
    value: EventsTypeEnum.SO_SERVICE,
  },
  {
    label: t('sys.model.serviceScript'),
    value: EventsTypeEnum.SCRIPT_SERVICE,
  },
];

export const formatData = (data: CategoryCompleteResponse[]) => {
  const options: any = [];
  if (data) {
    for (const folder of data) {
      const item: any = {
        id: folder.id,
        name: folder.name,
        label: folder.name,
        options: [],
      };
      if (folder.children!.length > 0) {
        for (const i of folder.children!) {
          const obj = {
            id: i.id,
            label: i.name,
            value: i.key,
          };
          item.options.push(obj);
        }
      }
      options.push(item);
    }
  }
  return options;
};

export const getCh_TriggerType = (jsKey) => {
  const res = { ch: '', key: '' };
  if (/^i?script_.*/.test(jsKey)) {
    res.ch = t('sys.model.serviceScript');
    res.key = EventsTypeEnum.SCRIPT_SERVICE;
  } else if (/^i?so_.*/.test(jsKey)) {
    res.ch = t('sys.appDesigner.businessOrchestration');
    res.key = EventsTypeEnum.SO_SERVICE;
  }
  return res;
};
