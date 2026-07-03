import { get, pick } from 'lodash-es';
import { ComponentTypeEnum, RangeValidateMode } from '@gct/nocode-base';
import BaseComponent from '../_base_/BaseComponent';

import type {
  IComponent,
  IWrapperCmpConfigPrams,
} from '/@online-form/views/types/base-core-component.d';

import type { BaseCoreComponent, IDatepickerProps } from '@gct/nocode-base';

class Datepicker extends BaseComponent implements IComponent {
  component = ComponentTypeEnum.Datepicker;
  wrapperCmpConfig({ data }: IWrapperCmpConfigPrams) {
    const separator = get(data.info, 'formatSeparator', '-');
    const formatTemplate = get(data.info, 'formatTemplate', 'YYYY-MM-DD').replace(
      /\${sep}/g,
      separator,
    );
    const dateType = formatTemplate.replace(new RegExp(`\\${separator}`, 'g'), '-');

    const cmp: {
      props: IDatepickerProps;
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
        separator,
        dateType,
        format: formatTemplate,

        // 是否启用自定义格式化
        enableCustomFormat: get(data.info, 'customFormat', false),
        // 自定义格式化字符串
        customFormat: get(data.info, 'format'),
        defaultSysDate: get(data.info, 'defaultSystemDate', false),

        enableRangeValidate: get(data.info, 'enableRangeValidate', false),
        maxDateValidateMode: get(data.info, 'maxValidateMode', RangeValidateMode.No_Validate),
        minDateValidateMode: get(data.info, 'minValidateMode', RangeValidateMode.No_Validate),
        minDate: get(data.info, 'min'),
        minDateFormulaExpr: get(data.info, 'minExpr'),
        maxDate: get(data.info, 'max'),
        maxDateFormulaExpr: get(data.info, 'maxExpr'),
      },
      style: this.getCommonStyle(data),
      event: this.getCommonEvent(data),
      formItem: true,
    };

    return cmp;
  }
}

export default new Datepicker();
