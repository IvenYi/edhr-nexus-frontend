import { defineComponent, computed, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import './select-editor.scss';

export const SelectEditor = defineComponent({
  name: 'SelectEditor',
  props: {
    value: {
      type: String || Number,
    },
    options: {
      type: Function || Array,
    },
    placeholder: {
      type: String,
    },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const ns = useNamespace('select-editor');

    const items = ref(Array.isArray(props.options) ? props.options : []);

    const val = computed({
      get() {
        return props.value || undefined;
      },
      set(val) {
        emit('update:value', val);
      },
    });

    const onFocus = async () => {
      if (typeof props.options === 'function') {
        items.value = await props.options();
      }
    };

    if (val.value) {
      onFocus();
    }

    return { ns, val, items, onFocus };
  },
  render() {
    return (
      <a-select
        getPopupContainer={(element) => element.parentNode}
        v-model:value={this.val}
        options={this.items}
        onFocus={this.onFocus}
        placeholder={$t(this.placeholder || 'sys.chooseText')}
      />
    );
  },
});

export default SelectEditor;
