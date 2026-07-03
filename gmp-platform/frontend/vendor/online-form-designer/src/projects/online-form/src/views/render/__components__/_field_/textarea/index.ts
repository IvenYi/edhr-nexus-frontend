import { get, pick } from 'lodash-es';
import { ComponentTypeEnum, BindCmpStyleEnum } from '@gct/nocode-base';
import BaseComponent from '../_base_/BaseComponent';

import type {
  IComponent,
  IWrapperCmpConfigPrams,
} from '/@online-form/views/types/base-core-component.d';

import type { BaseCoreComponent, ITextareaProps } from '@gct/nocode-base';

class Textarea extends BaseComponent implements IComponent {
  component = ComponentTypeEnum.Textarea;
  wrapperCmpConfig({ data }: IWrapperCmpConfigPrams) {
    const cmp: {
      props: ITextareaProps;
      style: any;
      event: BaseCoreComponent.FieldEventProps;
      formItem: boolean;
    } = {
      props: {
        ...this.getCommonProps(data),
        ...pick(data.info, [
          'placeholder',
          'defaultValue',
          'minlength',
          'maxlength',
          'regex',
          'regexHint',
        ]),
        bindCompStyleType: get(data.info, 'renderComp', BindCmpStyleEnum.CMP_TEXTAREA),

        prefix: get(data.info, 'prefix'),
        suffix: get(data.info, 'suffix'),
        size: get(data.info, 'fontSize', 12),
      },
      style: this.getCommonStyle(data),
      event: this.getCommonEvent(data),
      formItem: true,
    };

    return cmp;
  }
}

export default new Textarea();
