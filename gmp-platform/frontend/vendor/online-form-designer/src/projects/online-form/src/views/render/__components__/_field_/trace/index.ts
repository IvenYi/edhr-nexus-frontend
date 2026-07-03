import { get, pick } from 'lodash-es';
import { ComponentTypeEnum, BindCmpStyleEnum } from '@gct/nocode-base';
import BaseComponent from '../_base_/BaseComponent';

import type {
  IComponent,
  IWrapperCmpConfigPrams,
} from '/@online-form/views/types/base-core-component.d';

import type { BaseCoreComponent, ITraceProps } from '@gct/nocode-base';

class Trace extends BaseComponent implements IComponent {
  component = ComponentTypeEnum.Trace;
  wrapperCmpConfig({ data }: IWrapperCmpConfigPrams) {
    const separator = get(data.info, 'formatSeparator', '-');
    const formatTemplate = get(data.info, 'formatTemplate', 'YYYY-MM-DD').replace(
      /\${sep}/g,
      separator,
    );
    const dateType = formatTemplate.replace(new RegExp(`\\${separator}`, 'g'), '-');

    const cmp: {
      props: ITraceProps;
      style: any;
      event: BaseCoreComponent.FieldEventProps;
      formItem: boolean;
    } = {
      props: {
        ...this.getCommonProps(data),
        ...pick(data.info, ['placeholder']),
        bindCompStyleType: get(data.info, 'renderComp', BindCmpStyleEnum.CMP_TEXT),
        prefix: get(data.info, 'prefix'),
        suffix: get(data.info, 'suffix'),
        size: get(data.info, 'fontSize', 12),

        separator,
        dateType,
        format: formatTemplate,
        // 是否启用自定义格式化
        enableCustomFormat: get(data.info, 'customFormat', false),
        // 自定义格式化字符串
        customFormat: get(data.info, 'format'),
        defaultSysDate: get(data.info, 'defaultSystemDate', false),
        autofillRules: get(data.info, 'autofillRules', []),
        parseRuleProps: get(data.info, 'parseRuleProps'),
      },
      style: this.getCommonStyle(data),
      event: this.getCommonEvent(data),
      formItem: true,
    };

    return cmp;
  }
}

export default new Trace();
