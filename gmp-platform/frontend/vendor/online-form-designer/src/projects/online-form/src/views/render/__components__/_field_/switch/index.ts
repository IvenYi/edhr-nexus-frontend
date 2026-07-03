import { get, pick } from 'lodash-es';
import {
  ComponentTypeEnum,
  BindCmpStyleEnum,
  LabelPosition,
  Orientation,
  BooleanShowMode,
} from '@gct/nocode-base';
import { getFieldWidget } from '../../../__components__/index';
import BaseComponent from '../_base_/BaseComponent';

import type {
  IComponent,
  IWrapperCmpConfigPrams,
} from '/@online-form/views/types/base-core-component.d';

import type { BaseCoreComponent, ISwitchProps } from '@gct/nocode-base';

class Switch extends BaseComponent implements IComponent {
  component = ComponentTypeEnum.Switch;
  wrapperCmpConfig({ data }: IWrapperCmpConfigPrams) {
    const cmp: {
      props: ISwitchProps;
      style: any;
      event: BaseCoreComponent.FieldEventProps;
      formItem: boolean;
    } = {
      props: {
        ...this.getCommonProps(data),
        ...pick(data.info, ['defaultValue']),

        trueText: get(data.info, 'trueText', $t('sys.real')),
        falseText: get(data.info, 'falseText', $t('sys.fake')),
        bindCompStyleType: get(data.info, 'renderComp', BindCmpStyleEnum.CMP_SELECT_LIST),

        labelPos: get(data.info, 'labelPosition', LabelPosition.After),
        displayMode: get(data.info, 'showMode', BooleanShowMode.Both),
        direction: get(data.info, 'direction', Orientation.Landscape),
        letterSpace: get(data.info, 'iconLabelSpace', 0),
        size: get(data.info, 'fontSize', 12),
      },
      style: this.getCommonStyle(data),
      event: this.getCommonEvent(data),
      formItem: true,
    };

    cmp.props.trueRefFields = get(data.info, 'trueAttachFields', [])
      .map((fieldInfo) => getFieldWidget(fieldInfo, data.style))
      .filter((i) => i);
    cmp.props.falseRefFields = get(data.info, 'falseAttachFields', [])
      .map((fieldInfo) => getFieldWidget(fieldInfo, data.style))
      .filter((i) => i);

    return cmp;
  }
}

export default new Switch();
