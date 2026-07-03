/* eslint-disable vue/no-setup-props-destructure */
/* eslint-disable vue/no-mutating-props */
import { defineComponent, PropType, watch } from 'vue';
import dayjs, { Dayjs } from 'dayjs';
import { useNamespace, useFormValue, IEditorBasic, IFormItem } from '@gct/runtime';
import './form-date-range.scss';

export const FormDateRange = defineComponent({
  name: 'FormDateRange',
  props: {
    itemModel: {
      type: Object as PropType<IFormItem>,
      required: true,
    },
    model: {
      type: Object as PropType<IEditorBasic>,
      required: true,
    },
    data: {
      type: Object as PropType<IData>,
      required: true,
    },
    value: {
      type: Object as PropType<Dayjs[]>,
      default: () => [],
    },
  },
  emits: ['update:value'],
  setup(props) {
    const ns = useNamespace('form-date-range');

    const val = useFormValue<Dayjs[]>();

    const editorProps = props.model.props || {};

    const fields = props.itemModel.fields || [];

    const [startKey, endKey] = fields;

    const defaultVal = props.itemModel.default;

    if (defaultVal && defaultVal.length > 0) {
      val.value = defaultVal.map((item) => (item ? dayjs(item) : null));
    }

    watch(val, () => {
      if (val.value) {
        const [start, end] = val.value;
        if (start) {
          props.data[startKey] = start.format(props.model.format || 'YYYY-MM-DD HH:mm:ss');
        }
        if (end) {
          props.data[endKey] = end.format(props.model.format || 'YYYY-MM-DD HH:mm:ss');
        }
      }
    });

    return { ns, val, editorProps };
  },
  render() {
    return (
      <a-range-picker
        {...this.editorProps}
        v-model:value={this.val}
        class={this.ns.b()}
        show-time
        placeholder={this.model.placeholder}
      />
    );
  },
});
