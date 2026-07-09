import { fontStyleAttrs } from '/@online-form/utils/config.enum';
import { ComponentTypeEnum } from '@gct/nocode-base';
import { getFieldWidget } from '../../../__components__/index';
import { pick } from 'lodash-es';

import type { IComponent } from '/@online-form/views/types/base-core-component.d';

import type { ICombineFieldsProps } from '@gct/nocode-base';

class CombineFields implements IComponent {
  component = ComponentTypeEnum.CombineFields;
  wrapperCmpConfig({ data }) {
    const cmp: { props: ICombineFieldsProps } = {
      props: {
        fields: [],
      },
      style: {
        ...pick(data.style ?? {}, fontStyleAttrs),
      },
    };

    data.fieldInfos.forEach((fieldInfo) => {
      const fieldWidget = getFieldWidget(fieldInfo, data.style);
      if (fieldWidget) {
        cmp.props.fields.push(fieldWidget);
      }
    });

    return cmp;
  }
}

export default new CombineFields();
