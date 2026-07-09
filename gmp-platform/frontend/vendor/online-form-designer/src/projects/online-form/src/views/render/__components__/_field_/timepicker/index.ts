import { get, pick } from 'lodash-es';
import { ComponentTypeEnum } from '@gct/nocode-base';
import BaseComponent from '../_base_/BaseComponent';

import type {
  IComponent,
  IWrapperCmpConfigPrams,
} from '/@online-form/views/types/base-core-component.d';

import type { BaseCoreComponent, ITimepickerProps } from '@gct/nocode-base';

class Timepicker extends BaseComponent implements IComponent {
  component = ComponentTypeEnum.Timepicker;
  wrapperCmpConfig({ data }: IWrapperCmpConfigPrams) {
    const cmp: {
      props: ITimepickerProps;
      style: any;
      event: BaseCoreComponent.FieldEventProps;
      formItem: boolean;
    } = {
      props: {
        ...this.getCommonProps(data),
        ...pick(data.info, ['placeholder']),

        prefix: get(data.info, 'prefix'),
        suffix: get(data.info, 'suffix'),
        size: get(data.info, 'fontSize', 12),

        timeType: get(data.info, 'formatTemplate', 'HH:mm:ss'),
        format: get(data.info, 'formatTemplate', 'HH:mm:ss'),
        // 是否启用自定义格式化
        enableCustomFormat: get(data.info, 'customFormat', false),
        // 自定义格式化字符串
        customFormat: get(data.info, 'format'),
        defaultSysDate: get(data.info, 'defaultSystemDate', false),
      },
      style: this.getCommonStyle(data),
      event: this.getCommonEvent(data),
      formItem: true,
    };

    return cmp;
  }
}

export default new Timepicker();
