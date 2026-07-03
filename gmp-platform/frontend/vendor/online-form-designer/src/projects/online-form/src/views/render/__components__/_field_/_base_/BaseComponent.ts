import { get, pick } from 'lodash-es';
import { fontStyleAttrs } from '/@online-form/utils/config.enum';
import type { BaseCoreComponent } from '@gct/nocode-base';

export default class BaseComponent {
  protected getCommonProps(data: any): BaseCoreComponent.FieldBasicProps {
    console.log(data.info);
    return {
      ...pick(data.info, [
        'field',
        'fieldType',
        'fieldLink',
        'modelKey',
        'isFieldModel',
        'subModelKey',
        'subFieldKey',
        'createType',
        'refModelKey',
        'viewState',
      ]),
      readonly: true,
      field_readonly: false,
      required: get(data.info, 'required', false),
      disabled: get(data.info, 'disabled', false),
      nullValSymbol: get(data.info, 'emptySymbol'),
      cmpWidth: get(data.info, 'compWidth', 75),
      cmpHeight: get(data.info, 'compHeight', 30),
      componentDependency: get(data.info, 'componentDependency', undefined),
    };
  }

  protected getCommonStyle(data: any): any {
    return {
      ...pick(data.style ?? {}, fontStyleAttrs),
    };
  }

  protected getCommonEvent(data: any): BaseCoreComponent.FieldEventProps {
    return {
      type: get(data.info, 'eventType'),
      name: get(data.info, 'eventMethod'),
    };
  }
}
