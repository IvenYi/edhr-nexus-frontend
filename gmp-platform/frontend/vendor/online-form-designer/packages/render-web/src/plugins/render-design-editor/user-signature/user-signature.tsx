import { defineComponent, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { nodeEditorProps as props } from '@gct/runtime-render';
import './user-signature.scss';

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

    try {
      onInit();
    } catch (error) {
      console.error('Error in UserSignature:', error);
    }

    return () => {
      return (
        <div class={ns.b()}>
          {val.value.map((item) => {
            return (
              <div class={ns.e('item')}  onClick={(e) => e.stopPropagation()}>
                <a-image src={'/minio/' + item.url} height='100%' width='100%' />
              </div>
            );
          })}
        </div>
      );
    };
  },
});
