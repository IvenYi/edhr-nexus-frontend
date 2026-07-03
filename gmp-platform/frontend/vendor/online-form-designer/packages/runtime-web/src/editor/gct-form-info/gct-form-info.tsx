import { defineComponent, PropType } from 'vue';
import { useNamespace, useGctFormValue, IInfoEditor, nullDisplayEnum } from '@gct/runtime';
import './gct-form-info.scss';

export const GctFormInfo = defineComponent({
  name: 'GctFormInfo',
  props: {
    value: {
      type: String,
      default: '',
    },
    model: {
      type: Object as PropType<IInfoEditor>,
      required: true,
    },
    size: {
      type: String,
    },
    isEmptyText: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:value'],
  setup() {
    const ns = useNamespace('gct-form-info');

    const val = useGctFormValue();

    return { ns, val };
  },
  render() {
    let info = this.val || this.model.content;
    if (!this.val && this.isEmptyText === true) {
      info = nullDisplayEnum[gct.appSetting.emptyDisplay] || '';
    }
    return (
      <div class={[this.ns.b(), this.size ? this.ns.m(this.size) : null]}>
        {this.model.icon ? (
          <span class={this.ns.e('icon')}>
            <i class={`iconfont ${this.model.icon}`} />
          </span>
        ) : null}
        <span class={this.ns.e('content')} title={info}>
          {info}
        </span>
      </div>
    );
  },
});
