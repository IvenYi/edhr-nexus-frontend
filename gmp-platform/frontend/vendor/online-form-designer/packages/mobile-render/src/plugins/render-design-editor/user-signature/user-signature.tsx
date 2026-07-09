import { defineComponent, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { nodeEditorProps as props } from '@gct/runtime-render';
import './user-signature.scss';
import { showImagePreview } from 'vant';
import { MOBILE_MINIO_PATH } from '@mobile/utils/const';

export const UserSignature = defineComponent({
  name: 'UserSignature',
  props,
  setup(props) {
    const ns = useNamespace('render-design-editor-user-signature');

    const val = ref<IObject[]>([]);

    function onInit(): void {
      if (props.value) {
        val.value = JSON.parse(props.value) as IObject[];
      }
    }
    const onPreview = (index) => {
      showImagePreview({
        images: val.value.map((i) => {
          return MOBILE_MINIO_PATH.value + i.url;
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
      console.error('Error in UserSignature:', error);
    }
    return () => {
      return (
        <div class={ns.b()}>
          {val.value.map((item, index) => {
            return (
              <div class={ns.e('item')} onClick={(e) => e.stopPropagation()}>
                <van-image
                  src={MOBILE_MINIO_PATH.value + item.url}
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
