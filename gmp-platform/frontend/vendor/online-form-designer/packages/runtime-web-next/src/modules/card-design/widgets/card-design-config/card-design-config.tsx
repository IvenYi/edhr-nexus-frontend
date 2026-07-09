import { defineComponent, PropType, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IDesignViewOptions, useDesignViewController } from '@gct/runtime-design';
import { ScaleSelect } from '@gct/runtime-web';
import domtoimage from 'dom-to-image';
import { t } from '@gct/runtime';
import { useCardViewStore } from '../../store';
import { CARD_MODE } from '../../enum';
import './card-design-config.scss';
import { snapdom } from '@zumer/snapdom';

export const CardDesignConfig = defineComponent({
  name: 'CardDesignConfig',
  props: {
    context: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    opts: {
      type: Object as PropType<IDesignViewOptions>,
      required: true,
    },
  },
  setup(props, { expose }) {
    const ns = useNamespace('card-design-config');
    const store = useCardViewStore();
    const c = useDesignViewController();

    const scale = ref(100);

    const contentRef = ref<HTMLDivElement | null>(null);

    async function getPreviewImage(): Promise<string> {
      if (!contentRef.value) {
        return '';
      }
      const result = await snapdom(contentRef.value, { scale: 0.6, quality: 0.8 });
      const image = await result.toWebp();
      return image.src;
    }

    expose({ getPreviewImage });

    return () => {
      return (
        <div class={[ns.b(), store.json.mode === CARD_MODE.SIMPLE ? ns.m('simple') : '']}>
          {store.json.mode === CARD_MODE.ADVANCED ? (
            <div class={ns.e('left')}>
              <material-content />
            </div>
          ) : null}
          <div class={ns.e('content')}>
            {c.store.map.size === 0 ? null : (
              <div class={ns.e('design-header')}>
                {/* <div class={ns.e('undo')}>
                <i class="iconfont icon-shangyibu" />
              </div>
              <div class={ns.e('redo')}>
                <i class="iconfont icon-xiayibu" />
              </div> */}
                <div class={ns.e('design-header-item')}>
                  <ScaleSelect v-model:value={scale.value} />
                </div>
              </div>
            )}
            <design-content style={{ zoom: scale.value / 100 }} opts={props.opts}>
              {{
                container: (child) => {
                  return (
                    <div class={ns.e('design-wrapper')}>
                      {c.store.map.size === 0 ? (
                        <div class={ns.e('design-not-font')}>
                          <div class={ns.em('design-not-font', 'img')}>
                            <img
                              src="/assets/card-design/pic_no_card.png"
                              alt={t('sys.cardDesign.select_model_placeholder')}
                            />
                          </div>
                          <div class={ns.em('design-not-font', 'text')}>
                            {t('sys.cardDesign.select_model_placeholder')}
                          </div>
                        </div>
                      ) : (
                        <div
                          class={ns.e('design-container')}
                          style={{
                            width: `${c.store.pageNode?.data.width + 2}px`,
                          }}
                        >
                          <div ref={(ref) => ((contentRef.value as any) = ref as HTMLDivElement)}>
                            {child}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                },
              }}
            </design-content>
          </div>
          <div class={ns.e('right')}>
            <panel-content context={props.context} />
          </div>
        </div>
      );
    };
  },
});
