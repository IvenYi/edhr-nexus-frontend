import {
  useFormItemController,
  IFormController,
  IFormItemBasic,
  IFormItemProvider,
  FormLineController,
  IFormLineController,
} from '@gct/runtime';

export class GctFormLineProvider implements IFormItemProvider {
  component = 'gct-form-line';

  createController(form: IFormController, item: IFormItemBasic): IFormLineController {
    return useFormItemController(() => new FormLineController(form, item));
  }
}
