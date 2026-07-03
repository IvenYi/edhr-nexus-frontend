import { provide, inject, onMounted, onUnmounted } from 'vue';
import { ControllerType } from '../../constant';
import { DesignViewController } from '../../controller';
import { IDesignViewController } from '../../interface';

/**
 * 获取设计界面控制器
 *
 * @author zhanghanrui
 * @date 2024-07-08 11:07:59
 * @export
 * @param {() => IDesignViewController} [fn]
 * @return {*}  {IDesignViewController}
 */
export function useDesignViewController(fn?: () => IDesignViewController): IDesignViewController {
  let c: IDesignViewController = inject(ControllerType.DESIGN_VIEW) as IDesignViewController;
  if (!c) {
    if (fn) {
      c = fn();
    } else {
      c = new DesignViewController();
    }
    provide(ControllerType.DESIGN_VIEW, c);
    onMounted(() => {
      c.mounted();
    });
    onUnmounted(() => {
      c.unmounted();
    });
  }
  return c;
}
