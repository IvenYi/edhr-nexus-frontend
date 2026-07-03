import { ComponentTypeEnum } from '@gct/nocode-base';
import { pick } from 'lodash-es';
import BaseComponent from '../../_field_/_base_/BaseComponent';
import type { IComponent } from '/@online-form/views/types/base-core-component.d';

import type { IDiagonalProps } from '@gct/nocode-base';

class Diagonal extends BaseComponent implements IComponent {
  component = ComponentTypeEnum.Diagonal;
  wrapperCmpConfig({ data }) {
    const cmp: { props: IDiagonalProps } = {
      props: {
        ...pick(data.info, [
          'id',
          'type',
          'names',
          'size',
          'direction',
          'bindFields',
          'enableFields',
        ]),
      },
      style: this.getCommonStyle(data),
    };

    return cmp;
  }
}

export default new Diagonal();
