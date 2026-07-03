import { inject, provide } from 'vue';
import { FormModelController } from './form-model-controller';

const FormModelControllerKey = 'GctFormModelController';

export function useFormModel() {
  /**
   * 注入控制器
   */
  function provideController(
    c: FormModelController = new FormModelController(),
  ): FormModelController {
    provide(FormModelControllerKey, c);
    return c;
  }

  /**
   * 获取控制器
   * @return {*}
   */
  function injectController(): FormModelController {
    return inject(FormModelControllerKey)!;
  }

  return {
    provideController,
    injectController,
  };
}
