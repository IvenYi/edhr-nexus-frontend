import { ComponentTypeEnum } from '@gct/nocode-base';
import { pick } from 'lodash-es';
import type { IComponent } from '/@online-form/views/types/base-core-component.d';
import type { IQrcodeProps } from '@gct/nocode-base';

class Qrcode implements IComponent {
  component = ComponentTypeEnum.Qrcode;
  wrapperCmpConfig({ data }) {
    const cmp: { props: IQrcodeProps } = {
      props: {
        ...pick(data.info, [
          'id',
          'type',
          'fieldType',
          'valueType',
          'value',
          'fieldLink',
          'modelKey',
          'isFieldModel',
          'subModelKey',
          'subFieldKey',
          'createType',
          'refModelKey',
          'codeType',
        ]),
        layout: {},
      },
    };

    return cmp;
  }
}

export default new Qrcode();
