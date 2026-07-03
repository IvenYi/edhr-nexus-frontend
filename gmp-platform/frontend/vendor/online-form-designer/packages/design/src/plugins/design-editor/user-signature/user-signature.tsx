import { defineComponent } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { nodeEditorProps as props } from '../../../props';
import './user-signature.scss';

export const UserSignature = defineComponent({
  name: 'UserSignature',
  props,
  setup() {
    const ns = useNamespace('design-editor-user-signature');

    return () => {
      return (
        <div class={ns.b()}>
          <div class={ns.e('preview')}>
            <i class="iconfont icon-tupian-shili" />
          </div>
        </div>
      );
    };
  },
});
