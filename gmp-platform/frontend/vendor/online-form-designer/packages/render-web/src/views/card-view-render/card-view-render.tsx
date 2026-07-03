import { computed, defineComponent, nextTick, ref, PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { gctMemoizeAsync } from '@gct/base';
import { DesignRender, DesignRenderViewPrefix } from '@gct/runtime-render';
import { getCommonInfoCardGetById } from '/@/apis/gct-apaas/CommonInfoCardController';
import './card-view-render.scss';

const loadModelAsync = gctMemoizeAsync(getCommonInfoCardGetById);

export const CardViewRender = defineComponent({
  name: 'CardViewRender',
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
    const ns = useNamespace('card-view-render');

    const isLoading = ref<boolean>(false);

    const isLoaded = ref<boolean>(false);

    const json = ref<IObject | null>(null);

    const data = ref<IObject>({});

    const style = computed(() => {
      if (json.value) {
        return {
          width: json.value.pageNode?.data.width ? `${json.value.pageNode.data.width}px` : '',
        };
      }
      return {};
    });

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
      });
    }

    onInit();

    return () => {
      return (
        <div class={ns.b()} style={style.value}>
          {isLoading.value ? <a-spin /> : null}
          {!json.value || !isLoaded.value ? null : (
            <DesignRender
              context={{ data: data.value, id: props.id, modelKey: props.modelKey }}
              model={{
                nodes: json.value.nodes,
                pageNode: json.value.pageNode,
                tree: json.value.tree,
                type: DesignRenderViewPrefix.CARD_VIEW,
              }}
              prefix={DesignRenderViewPrefix.CARD_VIEW}
              preview={props.preview}
            />
          )}
        </div>
      );
    };
  },
});
