import { get, pick } from 'lodash-es';
import { ComponentTypeEnum } from '@gct/nocode-base';
import BaseComponent from '../_base_/BaseComponent';

import type {
  IComponent,
  IWrapperCmpConfigPrams,
} from '/@online-form/views/types/base-core-component.d';
import type { BaseCoreComponent, IUploadFileProps } from '@gct/nocode-base';

class UploadFile extends BaseComponent implements IComponent {
  component = ComponentTypeEnum.UploadFile;
  wrapperCmpConfig({ data }: IWrapperCmpConfigPrams) {
    const fileTypes = get(data.info, 'acceptTypes', []);
    const cmp: {
      props: IUploadFileProps;
      style: any;
      event: BaseCoreComponent.FieldEventProps;
      formItem: boolean;
    } = {
      props: {
        ...this.getCommonProps(data),
        ...pick(data.info, ['maxCount', 'maxSize', 'showFileName']),

        accept: fileTypes.map((item) => item.toLocaleLowerCase()),
      },
      style: this.getCommonStyle(data),
      event: this.getCommonEvent(data),
      formItem: true,
    };

    return cmp;
  }
}

export default new UploadFile();
