import { inject, provide } from 'vue';
import { FormTmplConfigController } from './form-tmpl-config-controller';

const FormTmplConfigControllerKey = 'GctFormTmplConfigController';

/**
 * 表单模板里的设备互联模板配置
 * @export
 * @return {*}
 */
export function useFormTmplConfig() {
  /**
   * 注入控制器
   */
  function provideController(
    c: FormTmplConfigController = new FormTmplConfigController(),
  ): FormTmplConfigController {
    provide(FormTmplConfigControllerKey, c);
    return c;
  }

  /**
   * 获取控制器
   * @return {*}
   */
  function injectController(): FormTmplConfigController {
    return inject(FormTmplConfigControllerKey)!;
  }

  return {
    provideController,
    injectController,
  };
}
