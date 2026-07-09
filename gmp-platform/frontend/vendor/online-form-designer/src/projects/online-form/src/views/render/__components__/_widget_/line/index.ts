import { ComponentTypeEnum } from '@gct/nocode-base';
import { pick } from 'lodash-es';
import type { IComponent } from '/@online-form/views/types/base-core-component.d';
import type { ILineProps } from '@gct/nocode-base';

class Line implements IComponent {
  component = ComponentTypeEnum.Line;
  wrapperCmpConfig({ data }) {
    const cmp: { props: ILineProps } = {
      props: {
        ...pick(data.info, ['id', 'type', 'lineStyle']),
        layout: {
          ...pick(data.info.layout, ['width', 'height']),
        },
        styles: { ...data.info.styles },
      },
    };
    return cmp;
  }
}

export default new Line();
