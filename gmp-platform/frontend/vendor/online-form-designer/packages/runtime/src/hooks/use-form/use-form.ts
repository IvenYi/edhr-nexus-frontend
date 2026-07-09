import { inject } from 'vue';
import { IFormController } from '../../interface';

/**
 * 获取表单控制器
 *
 * @author zhanghanrui
 * @date 2024-04-02 17:04:17
 * @export
 * @return {*}  {IFormController}
 */
export function useForm(): IFormController {
  const c = inject<IFormController>('formController');
  return c!;
}
