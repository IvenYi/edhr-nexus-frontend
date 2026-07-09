import { computed, defineComponent, inject, PropType } from 'vue';
import {
  IEditFormController,
  IFormItemController,
  IPickerEditor,
  useNamespace,
} from '@gct/runtime';

export const GctFormPicker = defineComponent({
  name: 'GctFormPicker',
  props: {
    c: {
      type: Object as PropType<IFormItemController>,
      required: true,
    },
    model: {
      type: Object as PropType<IPickerEditor>,
      required: true,
    },
    value: {
      type: String,
      default: null,
    },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const ns = useNamespace('gct-form-picker');

    const formC = inject('formController') as IEditFormController;

    const nameVal = computed({
      get() {
        if (props.model.nameField) {
          return (formC.item[props.model.nameField] as IFormItemController).value;
        }
        return '';
      },
      set(v) {
        if (props.model.nameField) {
          return ((formC.item[props.model.nameField] as IFormItemController).editorValue = v);
        }
      },
    });

    const val = computed({
      get: () => {
        const opt = props.c.state.options.find((_) => {
          return _.value === props.value;
        });
        if (!opt && nameVal.value) {
          return nameVal.value;
        }
        return props.value;
      },
      set: (newVal: any) => {
        if (typeof newVal === 'string') {
          newVal = newVal.trim();
        }
        if (typeof newVal != 'object' && props.value == newVal) {
          return;
        }
        const item = props.c.state.options.find((_) => {
          return _.value === newVal;
        });
        if (item && item.data && props.model.fieldMap) {
          props.model.fieldMap.map((key) => {
            const [key1, key2] = key.split(':');
            if (key2) {
              (formC.item[key2] as IFormItemController).editorValue = item.data![key1];
            }
          });
        }
        emit('update:value', newVal);
      },
    });

    const loadOptions = () => {
      return props.c.loadDictionary();
    };

    // 初始化有值时直接加载选项
    if (val.value != null) {
      props.c.loadDictionary();
    }

    const onChange = (_val, data) => {
      nameVal.value = data.label;
    };

    return { ns, val, nameVal, loadOptions, onChange };
  },
  render() {
    return (
      <a-select
        v-model:value={this.val}
        {...(this.model.props || {})}
        class={this.ns.b()}
        disabled={this.c.state.disabled}
        loading={this.c.state.loading}
        options={this.c.state.options}
        placeholder={this.model.placeholder}
        onDropdownVisibleChange={this.loadOptions}
        onChange={this.onChange}
        show-search
        filter-option={(input: string, option: any) => {
          if (option.label) {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          }
          return false;
        }}
      />
    );
  },
});
