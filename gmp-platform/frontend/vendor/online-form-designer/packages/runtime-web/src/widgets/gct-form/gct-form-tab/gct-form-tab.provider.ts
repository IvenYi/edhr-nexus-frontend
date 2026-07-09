import {
  FormTabController,
  useFormItemController,
  IFormController,
  IFormTabController,
  IFormItemBasic,
  IFormItemProvider,
} from '@gct/runtime';

export class GctFormTabProvider implements IFormItemProvider {
  component = 'gct-form-tab';

  createController(form: IFormController, item: IFormItemBasic): IFormTabController {
    return useFormItemController(() => new FormTabController(form, item));
  }
}
