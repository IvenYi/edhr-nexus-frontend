import { defineComponent, ref, toRefs, PropType } from 'vue';
import { useNamespace } from '@gct/runtime';
import './serial-preview.scss';

export const SerialPreview = defineComponent({
  name: 'SerialPreview',
  props: {
    isNew: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object as PropType<any>,
      default: () => {},
    },
  },
  setup(props) {
    const { data, isNew } = toRefs(props);

    const ns = useNamespace('serial-preview');

    let value = isNew.value === true ? data.value.newData : data.value.oldData;

    if (isNew.value) {
      if (data.value.newDict) {
        value = data.value.newDict.join(',');
      }
    } else {
      if (data.value.oldDict) {
        value = data.value.oldDict.join(',');
      }
    }

    const val = ref<string>(value != null && value != 'null' ? value : '');

    return { ns, val };
  },
  render() {
    return <div class={this.ns.b()}>{this.val.toString()}</div>;
  },
});
