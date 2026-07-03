import { get, pick, has } from 'lodash-es';
import {
  ComponentTypeEnum,
  BindCmpStyleEnum,
  RangeValidateMode,
  DecimalDisplayMode,
} from '@gct/nocode-base';
import BaseComponent from '../_base_/BaseComponent';
import type {
  IComponent,
  IWrapperCmpConfigPrams,
} from '/@online-form/views/types/base-core-component.d';

import type { BaseCoreComponent, IInputNumberProps } from '@gct/nocode-base';

class InputNumber extends BaseComponent implements IComponent {
  component = ComponentTypeEnum.Inputnumber;
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
      props: IInputNumberProps;
      style: any;
      event: BaseCoreComponent.FieldEventProps;
      formItem: boolean;
    } = {
      props: {
        ...this.getCommonProps(data),
        ...pick(data.info, ['placeholder', 'defaultValue']),

        bindCompStyleType: get(data.info, 'renderComp', BindCmpStyleEnum.CMP_TEXT),

        precision: get(data.info, 'precision', 0),

        enableStepCounter: get(data.info, 'enableStepCounter', false),
        stepCounter: get(data.info, 'stepCounter', 1),

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

export default new InputNumber();
