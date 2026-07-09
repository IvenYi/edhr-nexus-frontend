import { defineComponent, nextTick, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { getCommonInfoCardGetById } from '/@/apis/gct-apaas/CommonInfoCardController';
import { DesignRenderViewPrefix } from '@gct/runtime-render';
import { gctMemoizeAsync } from '@gct/base';
import './mob-card-view-render.scss';

const loadModelAsync = gctMemoizeAsync(getCommonInfoCardGetById);

export const MobCardViewRender = defineComponent({
  name: 'MobCardViewRender',
  props: {
    // 卡片设计模型标识，根据此标识获取对应的设计模型
    id: {
      type: String,
      required: true,
    },
    modelKey: {
      type: String,
      required: true,
    },
    fetch: {
      type: Function as PropType<() => Promise<IObject>>,
    },
    preview: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['mounted'],
  setup(props, { emit }) {
    const ns = useNamespace('mob-card-view-render');

    const isLoading = ref<boolean>(false);

    const isLoaded = ref<boolean>(false);

    const json = ref<IObject | null>(null);

    const data = ref<IObject>({});

    async function loadModel(): Promise<void> {
      const res = await loadModelAsync({
        id: props.id,
        modelKey: props.modelKey,
        type: 'CARD',
      });
      if (res && res.designerJson) {
        json.value = JSON.parse(decodeURIComponent(res.designerJson));
      }
    }

    async function onInit(): Promise<void> {
      if (!props.id) {
        return;
      }
      try {
        isLoading.value = true;
        await loadModel();
        if (props.preview !== true && props.fetch) {
          data.value = (await props.fetch()) || {};
        }
      } catch (error) {
        console.error(error);
      } finally {
        isLoading.value = false;
      }
      isLoaded.value = true;
      await nextTick();
      setTimeout(() => {
        emit('mounted', json.value?.pageNode?.data);
      }, 0);
    }

    onInit();

    return () => {
      return (
        <div class={ns.b()}>
          {isLoading.value ? <van-loading /> : null}
          {!json.value || !isLoaded.value ? null : (
            <design-render
              context={{ data: data.value, id: props.id, modelKey: props.modelKey }}
              model={{
                nodes: json.value.nodes,
                pageNode: json.value.pageNode,
                tree: json.value.tree,
                type: DesignRenderViewPrefix.MOBILE_CARD_VIEW,
              }}
              prefix={DesignRenderViewPrefix.MOBILE_CARD_VIEW}
              preview={props.preview}
            />
          )}
        </div>
      );
    };
  },
});
