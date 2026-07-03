import { fontStyleAttrs } from '/@online-form/utils/config.enum';
import { ComponentTypeEnum } from '@gct/nocode-base';
import { pick } from 'lodash-es';

import type {
  IComponent,
  IWrapperCmpConfigPrams,
} from '/@online-form/views/types/base-core-component.d';
import type { IROProps } from '@gct/nocode-base';

class Ro implements IComponent {
  component = ComponentTypeEnum.RO;
  wrapperCmpConfig({ data }: IWrapperCmpConfigPrams) {
    const cmp: { props: IROProps; style: any } = {
      props: {
        value: data.text,
      },
      style: {
        ...pick(data.style ?? {}, [...fontStyleAttrs, 'writingMode']),
      },
    };
    return cmp;
  }
}

export default new Ro();
