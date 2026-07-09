import { get, omit, merge, pick } from 'lodash-es';
import { ComponentTypeEnum, BindCmpStyleEnum, LabelPosition, Orientation } from '@gct/nocode-base';
import BaseComponent from '../_base_/BaseComponent';

import { getFieldWidget } from '../../../__components__/index';

import type {
  IComponent,
  IWrapperCmpConfigPrams,
} from '/@online-form/views/types/base-core-component.d';

import type { BaseCoreComponent, IEnumSelectProps } from '@gct/nocode-base';

class EnumSelect extends BaseComponent implements IComponent {
  component = ComponentTypeEnum.EnumSelect;
  wrapperCmpConfig({ data }: IWrapperCmpConfigPrams) {
    const cmp: {
      props: IEnumSelectProps;
      style: any;
      event: BaseCoreComponent.FieldEventProps;
      formItem: boolean;
    } = {
      props: {
        ...this.getCommonProps(data),
        ...pick(data.info, ['placeholder']),
        bindCompStyleType: get(data.info, 'renderComp', BindCmpStyleEnum.CMP_SELECT_LIST),
        labelPos: get(data.info, 'labelPosition', LabelPosition.After),
        direction: get(data.info, 'direction', Orientation.Landscape),
        letterSpace: get(data.info, 'iconLabelSpace', 0),
        size: get(data.info, 'fontSize', 12),
      },
      style: this.getCommonStyle(data),
      event: this.getCommonEvent(data),
      formItem: true,
    };

    const options = get(data.info, 'options', []).map((item) => {
      return {
        ...omit(item, 'attachFields'),
        label: item.text,
        refFields: get(item, 'attachFields', [])
          .map((fieldInfo) => getFieldWidget(fieldInfo, data.style))
          .filter((i) => i),
      };
    });

    const defaultValues = options
      .filter((item) => item.defaultSelected)
      .map((item) => item.value)
      .join(',');

    merge(cmp.props, {
      defaultValue: defaultValues,
      optionsJson: JSON.stringify(options),
    });

    return cmp;
  }
}

export default new EnumSelect();
