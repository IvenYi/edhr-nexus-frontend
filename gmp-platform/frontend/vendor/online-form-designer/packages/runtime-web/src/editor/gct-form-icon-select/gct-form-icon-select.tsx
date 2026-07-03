import { defineComponent, ref, watch, PropType, computed } from 'vue';
import { IIconSelectEditor, useNamespace } from '@gct/runtime';
import './gct-form-icon-select.scss';

export const GctFormIconSelect = defineComponent({
  name: 'GctFormIconSelect',
  props: {
    value: {
      type: Object as PropType<any>,
    },
    model: {
      type: Object as PropType<IIconSelectEditor>,
      required: true,
    },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const ns = useNamespace('gct-form-icon-select');

    const val = ref<any>(props.value);

    const icon = ref<string>(val.value?.icon || props.model.defaultIcon);

    const color = ref<string>(val.value?.color || props.model.defaultColor);

    const background = ref<string>(val.value?.background || props.model.defaultBackground);

    watch(
      () => props.value,
      (newVal) => {
        val.value = newVal;
        if (newVal) {
          icon.value = newVal.icon;
          color.value = newVal.color;
        }
      },
    );

    watch([icon, color, background], () => {
      val.value = {
        icon: icon.value,
        color: color.value,
      };
      emit('update:value', val.value);
    });

    const nextPickerStyle = computed(() => {
      if (!props.model.size) {
        return;
      }
      return {
        '--box-size': props.model.size + 'px',
      };
    });

    return { ns, icon, color, background, nextPickerStyle };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <icon-next-picker
          v-model:value={this.icon}
          v-model:color={this.color}
          background="#f5f5f5"
          disabled={this.model.disabled}
          showColor={this.model.showColor === false ? false : true}
          style={this.nextPickerStyle}
        />
        {this.model.label ? <span class={this.ns.e('title')}>{this.model.label}</span> : null}
      </div>
    );
  },
});
