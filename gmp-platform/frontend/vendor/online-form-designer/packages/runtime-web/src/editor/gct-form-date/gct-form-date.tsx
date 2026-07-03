import { defineComponent, PropType, ref } from 'vue';
import { useNamespace, useGctFormValue, ITextEditor, EditorController } from '@gct/runtime';
import dayjs from 'dayjs';

/**
 * 文本编辑器
 */
export const GctFormDate = defineComponent({
  name: 'GctFormDate',
  props: {
    model: {
      type: Object as PropType<ITextEditor>,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
    isDate: {
      type: Boolean,
      default: true,
    },
    isTime: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:value'],
  setup(props) {
    const ns = useNamespace('gct-form-date');

    const c = new EditorController(props.model);

    const val = useGctFormValue();

    const dateVal = ref<dayjs.Dayjs | null>(val.value ? dayjs(val.value) : null);

    const timeVal = ref<dayjs.Dayjs | null>(val.value ? dayjs(val.value) : null);

    const onChange = () => {
      let str = '';
      if (dateVal.value) {
        const date = dateVal.value.format('YYYY-MM-DD');
        str = date;
      }
      if (timeVal.value) {
        const time = timeVal.value.format('HH:mm:ss');
        str += ` ${time}`;
      } else {
        str += ' 00:00:00';
      }
      val.value = str;
    };

    return { ns, c, dateVal, timeVal, onChange };
  },
  render() {
    return (
      <div class={[this.ns.b()]}>
        {this.isDate ? (
          <a-date-picker
            picker="date"
            v-model:value={this.dateVal}
            format="YYYY-MM-DD"
            {...(this.model.props || {})}
            placeholder="请选择日期"
            onChange={this.onChange}
          />
        ) : null}
        {this.isTime ? (
          <a-time-picker
            v-model:value={this.timeVal}
            placeholder="请选择时间"
            onChange={this.onChange}
          />
        ) : null}
      </div>
    );
  },
});
