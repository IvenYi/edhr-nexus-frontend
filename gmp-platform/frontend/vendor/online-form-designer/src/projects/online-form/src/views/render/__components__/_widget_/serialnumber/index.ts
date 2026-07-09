import { fontStyleAttrs } from '/@online-form/utils/config.enum';
import { ComponentTypeEnum } from '@gct/nocode-base';
import { pick } from 'lodash-es';

import type { IComponent } from '/@online-form/views/types/base-core-component.d';
import type { ISerialnumberProps } from '@gct/nocode-base';

class Serialnumber implements IComponent {
  component = ComponentTypeEnum.Serialnumber;
  wrapperCmpConfig({ data }) {
    const cmp: { props: ISerialnumberProps; style: any } = {
      props: {
        ...pick(data.info, ['id', 'type', 'initialValue', 'autoAddValue']),
      },
      style: {
        ...pick(data.style ?? {}, fontStyleAttrs),
      },
    };

    return cmp;
  }
}

export default new Serialnumber();
