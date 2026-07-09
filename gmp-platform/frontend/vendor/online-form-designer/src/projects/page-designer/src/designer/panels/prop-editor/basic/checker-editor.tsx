import { defineComponent } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { t } from '@gct/runtime';
import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
import './checker-editor.scss';

/**
 * 单一复选模式下的启用或关闭行为，类同于开关组件
 */
export const CheckerEditor = defineComponent({
  name: 'checker-editor',
  props,
  setup(defProps) {
    const ns = useNamespace('checker-editor');
    const propConfig = defProps.propConfig;
    const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

    return () => {
      return (
        <div class={ns.b()}>
          <a-checkbox v-model:checked={propValue.value as boolean}>
            {t(propConfig.label!)}
          </a-checkbox>
        </div>
      );
    };
  },
});

export default CheckerEditor;
