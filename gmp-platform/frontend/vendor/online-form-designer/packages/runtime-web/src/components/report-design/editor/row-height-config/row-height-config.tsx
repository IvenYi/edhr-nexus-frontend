import { computed, defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { useGctFormValue } from '@gct/runtime';
import { RowHeightSettingEnum } from '../../schema';
import './row-height-config.scss';

export const RowHeightConfig = defineComponent({
  name: 'RowHeightConfig',
  props: {
    value: {
      type: Object as PropType<IObject>,
      default: () => {
        return {
          type: RowHeightSettingEnum.LINE,
          maxRow: 10,
        };
      },
    },
  },
  setup() {
    const ns = useNamespace('row-height-config');
    const val = useGctFormValue();
    const type = computed({
      get() {
        return val.value.type;
      },
      set(_val) {
        val.value.type = _val;
        val.value = val.value;
      },
    });
    const maxRow = computed({
      get() {
        return val.value.maxRow;
      },
      set(_val) {
        if (!_val) {
          return;
        }
        val.value.maxRow = _val;
        val.value = val.value;
      },
    });
    return { ns, type, maxRow };
  },
  render() {
    return (
      <a-radio-group class={this.ns.b()} v-model:value={this.type} name="radioGroup">
        <a-radio value={RowHeightSettingEnum.LINE}>显示一行内容</a-radio>
        <a-radio value={RowHeightSettingEnum.ALL}>显示全部内容</a-radio>
        <a-radio value={RowHeightSettingEnum.OTHER}>
          <div class={this.ns.e('other')}>
            <span>显示最多</span>
            <a-input-number disabled={this.type !== RowHeightSettingEnum.OTHER} v-model:value={this.maxRow} size="small" min={2} max={10} />
            <span>行</span>
          </div>
        </a-radio>
      </a-radio-group>
    );
  },
});
