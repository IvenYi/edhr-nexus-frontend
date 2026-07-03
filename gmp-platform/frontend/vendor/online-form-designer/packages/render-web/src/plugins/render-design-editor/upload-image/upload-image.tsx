import { defineComponent, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { nodeEditorProps as props } from '@gct/runtime-render';
import './upload-image.scss';

export const UploadImage = defineComponent({
  name: 'UploadImage',
  props,
  setup(props) {
    const ns = useNamespace('render-design-editor-upload-image');

    const images = ref<string[]>([]);

    function onInit(): void {
      if (props.value) {
        images.value = props.value.split(',');
      }
    }

    try {
      onInit();
    } catch (error) {
      console.error('Error in UploadImage:', error);
    }

    return () => {
      return (
        <div class={ns.b()}>
          {images.value.map((image) => {
            return (
              <div class={ns.e('item')} onClick={(e) => e.stopPropagation()}>
                <a-image src={'/minio/' + image} height="100%" width="100%" />
              </div>
            );
          })}
        </div>
      );
    };
  },
});
