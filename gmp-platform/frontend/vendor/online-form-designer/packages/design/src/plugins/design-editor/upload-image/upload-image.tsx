import { defineComponent } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { nodeEditorProps as props } from '../../../props';
import './upload-image.scss';

export const UploadImage = defineComponent({
  name: 'UploadImage',
  props,
  setup() {
    const ns = useNamespace('design-editor-upload-image');
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
