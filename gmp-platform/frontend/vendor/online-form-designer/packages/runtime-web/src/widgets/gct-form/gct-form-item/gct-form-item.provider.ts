import {
  FormItemController,
  useFormItemController,
  IFormController,
  IFormItemBasic,
  IFormItemController,
  IFormItemProvider,
} from '@gct/runtime';

export class GctFormItemProvider implements IFormItemProvider {
  component = 'gct-form-item';

  createController(form: IFormController, item: IFormItemBasic): IFormItemController {
    return useFormItemController(() => new FormItemController(form, item));
  }
}
