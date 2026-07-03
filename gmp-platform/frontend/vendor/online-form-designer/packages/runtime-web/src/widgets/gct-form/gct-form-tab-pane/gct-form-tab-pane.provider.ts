import {
  FormTabPaneController,
  useFormItemController,
  IFormController,
  IFormTabPaneController,
  IFormItemBasic,
  IFormItemProvider,
} from '@gct/runtime';

export class GctFormTabPaneProvider implements IFormItemProvider {
  component = 'gct-form-tab-pane';

  createController(form: IFormController, item: IFormItemBasic): IFormTabPaneController {
    return useFormItemController(() => new FormTabPaneController(form, item));
  }
}
