import { get } from 'lodash-es';
import { ComponentTypeEnum, LabelPosition, Orientation, BooleanShowMode } from '@gct/nocode-base';
import BaseComponent from '../../_field_/_base_/BaseComponent';

import type {
  IComponent,
  IWrapperCmpConfigPrams,
} from '/@online-form/views/types/base-core-component.d';
import type { BaseCoreComponent, IDynValueProps } from '@gct/nocode-base';

class DynValue extends BaseComponent implements IComponent {
  component = ComponentTypeEnum.DynValue;
  wrapperCmpConfig({ data }: IWrapperCmpConfigPrams) {
    const cmp: {
      props: IDynValueProps;
      style: any;
      event: BaseCoreComponent.FieldEventProps;
      formItem: boolean;
    } = {
      props: {
        ...this.getCommonProps(data),
        prefix: get(data.info, 'prefix'),
        suffix: get(data.info, 'suffix'),
        size: get(data.info, 'fontSize', 12),

        // 布尔需要的默认配置
        labelPos: LabelPosition.After,
        displayMode: BooleanShowMode.Both,
        direction: Orientation.Landscape,
        letterSpace: 8,

        // 日期时间
        separator: '-',
      },
      style: this.getCommonStyle(data),
      event: this.getCommonEvent(data),
      formItem: true,
    };

    return cmp;
  }
}

export default new DynValue();
