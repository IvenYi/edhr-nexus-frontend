import { computed, defineComponent, PropType, toRefs } from 'vue';
import { AGLINE_ENUMS, LowCodeWidget, useNamespace } from '@gct/runtime';
import { ButtonContainer } from '/@/projects/page-designer/src/types/mobile';
import { IRenderContainerOptions } from '/@/projects/page-designer/src/designer/interface';
import './button-container-design2.scss';

export const ButtonContainerDesign2 = defineComponent({
  name: 'ButtonContainerDesign2',
  props: {
    widget: {
      type: Object as PropType<ButtonContainer>,
      required: true,
    },
    parentWidget: {
      type: Object as PropType<LowCodeWidget.BasicSchema>,
    },
  },
  setup(props) {
    const ns = useNamespace('button-container-design2');

    const { margin, align, buttonStyle, size } = toRefs(props.widget.props);

    // 是否为两端对齐，两端对齐的情况下。会将子 children 分为两组，children[0]、children[1]
    const isBetween = computed(() => {
      return AGLINE_ENUMS.BETWEEN === align!.value;
    });

    return { ns, margin, align, buttonStyle, size, isBetween };
  },
  render() {
    return (
      <div
        class={[this.ns.b(), this.ns.is('between', this.isBetween)]}
        style={{ 'text-align': this.isBetween ? 'left' : this.align }}
      >
        {this.$slots.default?.({
          parentWidget: this.widget,
          children: this.isBetween ? this.widget.children[0]?.children : this.widget.children,
          props: {
            style: { '--button-container-margin': `${this.margin}px` },
          },
          itemProps: {
            direction: 'horizontal',
          },
        } as IRenderContainerOptions)}
        {this.isBetween
          ? this.$slots.default?.({
              parentWidget: this.widget,
              children: this.widget.children[1]?.children,
              props: {
                style: { '--button-container-margin': `${this.margin}px` },
              },
              itemProps: {
                direction: 'horizontal',
              },
            } as IRenderContainerOptions)
          : null}
      </div>
    );
  },
});
