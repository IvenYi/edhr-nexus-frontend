import { defineComponent } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { nodeEditorProps as props } from '@gct/runtime-render';
import './upload-file.scss';

export const UploadFile = defineComponent({
  name: 'UploadFile',
  props,
  setup(props) {
    const ns = useNamespace('render-design-editor-upload-file');

    return () => {
      return (
        <div class={ns.b()}>
          <field-upload readonly modelValue={props.value} />
        </div>
      );
    };
  },
});
