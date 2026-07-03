import { fontStyleAttrs } from '/@online-form/utils/config.enum';
import { ComponentTypeEnum } from '@gct/nocode-base';

import { pick, get } from 'lodash-es';
import type { IComponent } from '/@online-form/views/types/base-core-component.d';
import type { ITimediffProps } from '@gct/nocode-base';

class Timediff implements IComponent {
  component = ComponentTypeEnum.Timediff;
  wrapperCmpConfig({ data }) {
    const cmp: { props: ITimediffProps; style: any } = {
      props: {
        ...pick(data.info, ['id', 'type', 'format']),

        startDefault: get(data.info, 'startDefault'),
        startField: get(data.info, 'startField'),
        endDefault: get(data.info, 'endDefault'),
        endField: get(data.info, 'endField'),

        layout: {},
      },
      style: {
        ...pick(data.style ?? {}, fontStyleAttrs),
      },
    };

    return cmp;
  }
}

export default new Timediff();
