import { computed, defineComponent, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import { calcFontStyle } from '@gct/base';
import { nodeContainerProps as props } from '../../../props';
import './design-panel-component.scss';

export const DesignPanelComponent = defineComponent({
  name: 'DesignPanelComponent',
  props,
  setup(defProps) {
    const ns = useNamespace('design-panel-component');

    const activeNames = ref<string[]>([defProps.data.id]);

    const fontStyle = computed(() => {
      return calcFontStyle(defProps.data.data);
    });

    return { ns, activeNames, fontStyle };
  },
  render() {
    const v = this.data.data;
    return (
      <div class={[this.ns.b(), this.ns.is('not-collapse', this.data.data.collapse === 0)]}>
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
                  {this.data.label}
                </span>
              </span>
            }
            name={this.data.id}
          >
            {{ default: this.$slots.default }}
          </van-collapse-item>
        </van-collapse>
      </div>
    );
  },
});
