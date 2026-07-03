import { defineComponent, PropType, computed } from 'vue';
import { ICodeItem, useNamespace } from '@gct/runtime';
import dayjs from 'dayjs';
import './span-editor.scss';

export const SpanEditor = defineComponent({
  name: 'SpanEditor',
  props: {
    value: { type: Object as PropType<any> },
    codeList: { type: Array as PropType<ICodeItem[]> },
    // 目前支持时间格式化
    format: { type: String },
    dateRange: { type: Boolean, default: false },
  },
  setup(props) {
    const ns = useNamespace('span-editor');

    const val = computed(() => {
      if (props.value) {
        if (props.dateRange && Array.isArray(props.value) && props.value.length === 2) {
          return `${dayjs(props.value[0]).format(props.format)} - ${dayjs(props.value[1]).format(
            props.format,
          )}`;
        }
        if (props.format && props.dateRange === false) {
          return dayjs(props.value).format(props.format);
        }
        if (props.codeList) {
          const item = props.codeList.find((item) => item.value === props.value);
          if (item) {
            return item.label;
          }
        }
      }
      return props.value || '';
    });

    return { ns, val };
  },
  render() {
    return (
      <div class="span-editor">
        {this.val}
        {this.$slots.default?.()}
      </div>
    );
  },
});

export default SpanEditor;
