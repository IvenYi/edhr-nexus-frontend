import { get } from 'lodash-es';
import {
  ComponentTypeEnum,
  SignatureTypeEnum,
  SignShowTypeEnum,
  SignatureTimeTypeEnum,
  SignatureNumberTypeEnum,
} from '@gct/nocode-base';
import BaseComponent from '../_base_/BaseComponent';

import type {
  IComponent,
  IWrapperCmpConfigPrams,
} from '/@online-form/views/types/base-core-component.d';

import type { BaseCoreComponent, ISignProps, IBindField } from '@gct/nocode-base';

class Sign extends BaseComponent implements IComponent {
  component = ComponentTypeEnum.Sign;
  wrapperCmpConfig({ data }: IWrapperCmpConfigPrams) {
    const cmp: {
      props: ISignProps;
      style: any;
      event: BaseCoreComponent.FieldEventProps;
      formItem: boolean;
    } = {
      props: {
        ...this.getCommonProps(data),

        signatureType: get(data.info, 'signatureType', SignatureTypeEnum.SIGNATURE_ONLY),
        signDisplayStyle: get(data.info, 'signDisplayStyle', SignShowTypeEnum.VERTICAL),
        signTimeType: get(data.info, 'signTimeType', SignatureTimeTypeEnum.FOLLOW_SIGNATURE),
        populateFields: get(data.info, 'populateFields', [])
          .map((fieldInfo: { fieldMeta: IBindField }) => fieldInfo.fieldMeta)
          .filter((i) => i),
        signatureNumber: get(
          data.info,
          'signatureNumber',
          SignatureNumberTypeEnum.SIGNATURE_MULTIPLE,
        ),
      },
      style: this.getCommonStyle(data),
      event: this.getCommonEvent(data),
      formItem: true,
    };

    return cmp;
  }
}

export default new Sign();
