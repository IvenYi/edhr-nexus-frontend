import { get, pick, has } from 'lodash-es';
import { ComponentTypeEnum, DecimalDisplayMode, RangeValidateMode } from '@gct/nocode-base';
import BaseComponent from '../_base_/BaseComponent';

import type {
  IComponent,
  IWrapperCmpConfigPrams,
} from '/@online-form/views/types/base-core-component.d';

import type { BaseCoreComponent, IInputDoubleProps } from '@gct/nocode-base';

class InputDouble extends BaseComponent implements IComponent {
  component = ComponentTypeEnum.InputDouble;
  wrapperCmpConfig({ data }: IWrapperCmpConfigPrams) {
    const script = {};
    if (has(data.info, 'isSuperScript') && typeof data.info.isSuperScript === 'boolean') {
      if (data.info.isSuperScript) {
        Object.assign(script, {
          upSup: get(data.info, 'scriptValue'),
        });
      } else {
        Object.assign(script, {
          downSub: get(data.info, 'scriptValue'),
        });
      }
    }

    const cmp: {
      props: IInputDoubleProps;
      style: any;
      event: BaseCoreComponent.FieldEventProps;
      formItem: boolean;
    } = {
      props: {
        ...this.getCommonProps(data),
        ...pick(data.info, ['placeholder', 'defaultValue']),
        precision: 0,
        enableRangeValidate: get(data.info, 'enableRangeValidate', false),
        maxValidateMode: get(data.info, 'maxValidateMode', RangeValidateMode.No_Validate),
        minValidateMode: get(data.info, 'minValidateMode', RangeValidateMode.No_Validate),
        minValue: get(data.info, 'min'),
        minFormulaExpr: get(data.info, 'minExpr'),
        maxValue: get(data.info, 'max'),
        maxFormulaExpr: get(data.info, 'maxExpr'),

        prefix: get(data.info, 'prefix'),
        suffix: get(data.info, 'suffix'),
        size: get(data.info, 'fontSize', 12),

        formulaExpr: get(data.info, 'expr'),
        displayMode: get(data.info, 'displayMode', DecimalDisplayMode.ORIGIN),
        ...script,
      },
      style: this.getCommonStyle(data),
      event: this.getCommonEvent(data),
      formItem: true,
    };

    return cmp;
  }
}

export default new InputDouble();
