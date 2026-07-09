import { ComponentTypeEnum } from '@gct/nocode-base';
import { pick } from 'lodash-es';

import type { IComponent } from '/@online-form/views/types/base-core-component.d';

import type { IBarcodeProps } from '@gct/nocode-base';

class Barcode implements IComponent {
  component = ComponentTypeEnum.Barcode;
  wrapperCmpConfig({ data }) {
    const cmp: { props: IBarcodeProps } = {
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
          'showValue',
        ]),
        layout: {},
        styles: { ...data.info.styles },
      },
    };

    return cmp;
  }
}

export default new Barcode();
