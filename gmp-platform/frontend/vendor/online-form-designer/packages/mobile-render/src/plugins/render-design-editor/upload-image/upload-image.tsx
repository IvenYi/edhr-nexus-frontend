import { defineComponent, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { nodeEditorProps as props } from '@gct/runtime-render';
import './upload-image.scss';
import { showImagePreview } from 'vant';
import { MOBILE_MINIO_PATH } from '@mobile/utils/const';

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
    const onPreview = (index) => {
      showImagePreview({
        images: images.value.map((i) => {
          return `${MOBILE_MINIO_PATH.value}${i}`;
        }),
        startPosition: index,
        overlayStyle: {
          backgroundColor: 'rgba(0,0,0, .45)',
        },
      });
    };
    try {
      onInit();
    } catch (error) {
      console.error('Error in UploadImage:', error);
    }

    return () => {
      return (
        <div class={ns.b()}>
          {images.value.map((image, index) => {
            return (
              <div class={ns.e('item')} onClick={(e) => e.stopPropagation()}>
                <van-image
                  src={MOBILE_MINIO_PATH.value + image}
                  height="100%"
                  width="100%"
                  onClick={() => onPreview(index)}
                />
              </div>
            );
          })}
        </div>
      );
    };
  },
});
