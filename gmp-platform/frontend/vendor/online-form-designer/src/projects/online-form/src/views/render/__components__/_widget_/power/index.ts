import { get, pick } from 'lodash-es';
import { fontStyleAttrs } from '/@online-form/utils/config.enum';
import { ComponentTypeEnum } from '@gct/nocode-base';

import type { IComponent } from '/@online-form/views/types/base-core-component.d';
import type { IPowerProps } from '@gct/nocode-base';

class Power implements IComponent {
  component = ComponentTypeEnum.Power;
  wrapperCmpConfig({ data }) {
    const cmp: { props: IPowerProps } = {
      props: {
        baseValueField: get(data.info, 'baseValueField'),
        exponentValueField: get(data.info, 'exponentValueField'),
        valueField: get(data.info, 'valueField'),
      },
      style: {
        ...pick(data.style ?? {}, fontStyleAttrs),
      },
    };
    console.log('cmp', cmp);
    return cmp;
  }
}

export default new Power();
