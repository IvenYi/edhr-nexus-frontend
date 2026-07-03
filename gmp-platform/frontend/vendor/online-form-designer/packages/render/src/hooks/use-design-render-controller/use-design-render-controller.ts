import { provide, inject, onMounted, onUnmounted, reactive } from 'vue';
import { ControllerType } from '../../constant';
import { DesignRenderController } from '../../controller';
import { IDesignRenderController } from '../../interface';

/**
 * 获取设计界面控制器
 *
 * @author zhanghanrui
 * @date 2024-07-08 11:07:59
 * @export
 * @param {() => IDesignRenderController} [fn]
 * @return {*}  {IDesignRenderController}
 */
export function useDesignRenderController(
  fn?: () => IDesignRenderController,
): IDesignRenderController {
  let c: IDesignRenderController = inject(ControllerType.DESIGN_RENDER) as IDesignRenderController;
  if (!c) {
    if (fn) {
      c = fn();
    } else {
      c = new DesignRenderController();
    }

    c.state = reactive(c.state);

    provide(ControllerType.DESIGN_RENDER, c);
    onMounted(() => {
      c.mounted();
    });
    onUnmounted(() => {
      c.unmounted();
    });
  }
  return c;
}
