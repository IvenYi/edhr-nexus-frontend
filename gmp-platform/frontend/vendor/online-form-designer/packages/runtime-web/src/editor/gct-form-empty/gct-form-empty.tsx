import { defineComponent } from 'vue';
import { useNamespace, useGctFormValue } from '@gct/runtime';

export const GctFormEmpty = defineComponent({
  name: 'GctFormEmpty',

  setup() {
    const ns = useNamespace('gct-form-empty');

    const val = useGctFormValue();

    return { ns, val };
  },
  render() {
    return <span></span>;
  },
});
export default GctFormEmpty;
