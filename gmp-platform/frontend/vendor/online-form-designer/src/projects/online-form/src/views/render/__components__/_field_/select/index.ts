import { get, pick } from 'lodash-es';
import { ComponentTypeEnum } from '@gct/nocode-base';
import BaseComponent from '../_base_/BaseComponent';

import type {
  IComponent,
  IWrapperCmpConfigPrams,
} from '/@online-form/views/types/base-core-component.d';

import type { BaseCoreComponent, ISelectProps } from '@gct/nocode-base';

class Select extends BaseComponent implements IComponent {
  component = ComponentTypeEnum.Select;
  wrapperCmpConfig({ data }: IWrapperCmpConfigPrams) {
    const searchField = get(data.info, 'searchField');
    const exp = searchField?.length ? `OR(${searchField.join(',')})` : '';
    const cmp: {
      props: ISelectProps;
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
        dataFilter: get(data.info, 'dataFilter'),
        autofillRules: get(data.info, 'autofillRules', []),
        quickSearchField: searchField,
        quickSearchExp: exp,
      },
      style: this.getCommonStyle(data),
      event: this.getCommonEvent(data),
      formItem: true,
    };

    return cmp;
  }
}

export default new Select();
