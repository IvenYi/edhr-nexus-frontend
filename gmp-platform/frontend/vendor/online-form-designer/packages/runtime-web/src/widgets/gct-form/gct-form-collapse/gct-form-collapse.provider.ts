import {
  FormCollapseController,
  useFormItemController,
  IFormController,
  IFormCollapseController,
  IFormItemBasic,
  IFormItemProvider,
} from '@gct/runtime';

export class GctFormCollapseProvider implements IFormItemProvider {
  component = 'gct-form-collapse';

  createController(form: IFormController, item: IFormItemBasic): IFormCollapseController {
    return useFormItemController(() => new FormCollapseController(form, item));
  }
}
