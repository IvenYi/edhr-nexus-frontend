import {
  FormHiddenItemController,
  useFormItemController,
  IFormController,
  IFormItemBasic,
  IFormItemProvider,
} from '@gct/runtime';

export class GctFormHiddenItemProvider implements IFormItemProvider {
  component = 'gct-form-hidden-item';

  createController(form: IFormController, item: IFormItemBasic): FormHiddenItemController {
    return useFormItemController(() => new FormHiddenItemController(form, item));
  }
}
