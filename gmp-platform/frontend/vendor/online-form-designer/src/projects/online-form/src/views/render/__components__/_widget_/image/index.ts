import { ComponentTypeEnum } from '@gct/nocode-base';
import { pick } from 'lodash-es';

import type { IComponent } from '/@online-form/views/types/base-core-component.d';
import type { IImageProps } from '@gct/nocode-base';

class Image implements IComponent {
  component = ComponentTypeEnum.Image;
  wrapperCmpConfig({ data }) {
    const cmp: { props: IImageProps } = {
      props: {
        ...pick(data.info, ['id', 'type', 'value', 'sizeMode']),
        layout: {
          ...pick(data.info.layout, ['width', 'height']),
        },
      },
    };
    return cmp;
  }
}

export default new Image();
