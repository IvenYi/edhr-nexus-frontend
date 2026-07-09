import { PropType, defineComponent, computed } from 'vue';
import { IFormItemController, ICheckboxEditor, useNamespace, useGctFormValue } from '@gct/runtime';
import { CheckboxGroup, Checkbox } from 'ant-design-vue';
import Draggable from 'vuedraggable';
import './gct-form-checkbox.scss';

export const GctFormCheckbox = defineComponent({
  name: 'GctFormCheckbox',
  props: {
    c: {
      type: Object as PropType<IFormItemController>,
      required: true,
    },
    model: {
      type: Object as PropType<ICheckboxEditor>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
    size: {
      type: String,
    },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const ns = useNamespace('gct-form-checkbox');

    const val = useGctFormValue();

    const checked = computed(() => {
      return props.model.isDrag
        ? (val.value || []).filter((e) => e.checked).map((e) => e.value)
        : val.value;
    });

    const options = computed(() => {
      if (props.model.isDrag) {
        return val.value && val.value?.length
          ? val.value.map((e) => {
              return {
                ...e,
                label: props.c.state.options.find((f) => f.value === e.value)?.label || '',
              };
            })
          : props.c.state.options;
      } else return props.c.state.options;
    });

    const onChange = (checkVal) => {
      options.value.forEach((e) => {
        if (
          props.model.minLength &&
          checkVal.length <= props.model.minLength &&
          checkVal.includes(e.value)
        ) {
          e.disabled = true;
        } else {
          e.disabled = false;
        }
        e.checked = checkVal.includes(e.value);
      });
      if (props.model.isDrag) {
        emit('update:value', options.value);
      } else {
        emit('update:value', checkVal);
      }
    };

    const onDragEnd = (e) => {
      const { newIndex, oldIndex } = e;
      options.value.splice(newIndex, 0, options.value.splice(oldIndex, 1)[0]);
      emit('update:value', options.value);
    };

    const slots = {
      item: ({ element }) => {
        return (
          <div class="drag-checkbox-item ks-row-middle">
            <i class="icon-drag iconfont mr4px cursor-move text-[#C3C3C3] primary-gct-hover"></i>
            <Checkbox value={element.value} disabled={element.disabled}>
              {element.label}
            </Checkbox>
          </div>
        );
      },
    };

    return { ns, checked, onChange, onDragEnd, slots, options };
  },
  render() {
    const attrs = {
      ...(this.model.props || {}),
      class: [this.ns.b(), this.ns.m('checkbox'), this.model.layout === 'column' && 'isColumn', this.size ? this.ns.m(this.size) : null],
      disabled: this.c.state.disabled,
    };
    return [
      <CheckboxGroup
        v-show={this.model.isDrag}
        v-model:value={this.checked}
        size={this.size}
        {...attrs}
        onChange={this.onChange}
      >
        <Draggable
          v-model={this.options}
          handle=".cursor-move"
          animation="200"
          chosen-class="drawing-chosen"
          drag-class="drawing-drag"
          item-key="value"
          class="drag-wrap"
          onEnd={this.onDragEnd}
          v-slots={this.slots}
        />
      </CheckboxGroup>,
      <CheckboxGroup
        v-show={!this.model.isDrag}
        v-model:value={this.checked}
        options={this.options}
        size={this.size}
        {...attrs}
        onChange={this.onChange}
      />,
    ];
  },
});

export default GctFormCheckbox;
