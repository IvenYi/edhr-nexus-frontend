import { get, pick } from 'lodash-es';
import { ComponentTypeEnum, ImageDisplayModeEnum } from '@gct/nocode-base';
import BaseComponent from '../_base_/BaseComponent';

import type {
  IComponent,
  IWrapperCmpConfigPrams,
} from '/@online-form/views/types/base-core-component.d';

import type { BaseCoreComponent, IUploadImageProps } from '@gct/nocode-base';

class UploadImage extends BaseComponent implements IComponent {
  component = ComponentTypeEnum.UploadImage;
  wrapperCmpConfig({ data }: IWrapperCmpConfigPrams) {
    const fileTypes = get(data.info, 'acceptTypes', []);
    const cmp: {
      props: IUploadImageProps;
      style: any;
      event: BaseCoreComponent.FieldEventProps;
      formItem: boolean;
    } = {
      props: {
        ...this.getCommonProps(data),
        ...pick(data.info, ['maxCount', 'maxSize']),

        accept: fileTypes.map((item) => item.toLocaleLowerCase()),
        imageDisplayMode: get(data.info, 'imageDisplayMode', ImageDisplayModeEnum.CUSTOM),
      },
      style: this.getCommonStyle(data),
      event: this.getCommonEvent(data),
      formItem: true,
    };

    return cmp;
  }
}

export default new UploadImage();
