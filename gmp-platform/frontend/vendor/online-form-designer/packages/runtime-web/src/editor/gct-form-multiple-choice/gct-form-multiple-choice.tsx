import { computed, defineComponent, PropType, ref } from 'vue';
import { IFormItemController, IMPickerEditor, useNamespace } from '@gct/runtime';

export const GctFormMultipleChoice = defineComponent({
  name: 'GctFormMultipleChoice',
  props: {
    c: {
      type: Object as PropType<IFormItemController>,
      required: true,
    },
    model: {
      type: Object as PropType<IMPickerEditor>,
      required: true,
    },
    value: {
      type: Array<String>,
      default: null,
    },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const ns = useNamespace('form-multiple-choice');

    const rootRef = ref();

    const val = computed({
      get: () => {
        return props.value ?? [];
      },
      set: (newVal: any) => {
        emit('update:value', newVal);
      },
    });

    const loadOptions = () => {
      return props.c.loadDictionary({}, props.model.force);
    };

    // 初始化有值时直接加载选项
    if (val.value != null) {
      props.c.loadDictionary();
    }

    return { ns, rootRef, val, loadOptions };
  },
  render() {
    return (
      <div ref="rootRef" class={this.ns.b()}>
        <a-select
          v-model:value={this.val}
          mode="multiple"
          max-tag-count={5}
          disabled={this.c.state.disabled}
          loading={this.c.state.loading}
          options={this.c.state.options}
          placeholder={this.model.placeholder}
          onDropdownVisibleChange={this.loadOptions}
          getPopupContainer={() => this.rootRef}
          {...(this.model.props || {})}
        />
      </div>
    );
  },
});
