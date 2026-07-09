import {
  FormCollapsePaneController,
  useFormItemController,
  IFormController,
  IFormCollapsePaneController,
  IFormItemBasic,
  IFormItemProvider,
} from '@gct/runtime';

export class GctFormCollapsePaneProvider implements IFormItemProvider {
  component = 'gct-form-collapse-pane';

  createController(form: IFormController, item: IFormItemBasic): IFormCollapsePaneController {
    return useFormItemController(() => new FormCollapsePaneController(form, item));
  }
}
