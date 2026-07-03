import {
  FormGroupController,
  useFormItemController,
  IFormController,
  IFormGroupController,
  IFormItemBasic,
  IFormItemProvider,
} from '@gct/runtime';

export class GctFormGroupProvider implements IFormItemProvider {
  component = 'gct-form-group';

  createController(form: IFormController, item: IFormItemBasic): IFormGroupController {
    return useFormItemController(() => new FormGroupController(form, item));
  }
}
