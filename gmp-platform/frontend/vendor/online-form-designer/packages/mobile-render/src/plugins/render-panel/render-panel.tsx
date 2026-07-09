import { defineComponent, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import { containerNodeProps as props } from '@gct/runtime-render';
import { calcFontStyle } from '@gct/base';
import './render-panel.scss';

export const RenderPanel = defineComponent({
  name: 'MobileRenderPanel',
  props,
  setup(defProps) {
    const ns = useNamespace('mobile-render-panel');

    const activeNames = ref<string[]>(
      defProps.model.data.defaultCollapse === false ? [defProps.model.id] : [],
    );

    const fontStyle = calcFontStyle(defProps.model.data);

    return { ns, activeNames, fontStyle };
  },
  render() {
    const v = this.model.data;
    return (
      <div class={[this.ns.b(), this.ns.is('not-collapse', this.model.data.collapse === 0)]}>
        <van-collapse v-model={this.activeNames}>
          <van-collapse-item
            title={
              <span class={this.ns.e('title')}>
                {v.icon && v.icon.icon ? (
                  <icon-next
                    value={v.icon.icon}
                    color={v.icon.color}
                    background={v.icon.background}
                    size={18}
                  />
                ) : null}
                <span class={this.ns.e('title-label')} style={this.fontStyle}>
                  {this.model.data.title}
                </span>
              </span>
            }
            name={this.model.id}
          >
            {{ default: this.$slots.default }}
          </van-collapse-item>
        </van-collapse>
      </div>
    );
  },
});
