import { defineComponent, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import { debounce } from 'lodash-es';
import { useI18n } from 'vue-i18n';
import './select-container.scss';

export const SelectContainer = defineComponent({
  name: 'SelectContainer',
  props: {
    caption: { type: String, default: '' },
    // 计数器总数
    total: { type: Number, default: 0 },
    // 计数器选中数
    count: { type: Number, default: 0 },
  },
  emits: ['search'],
  setup(_props, { emit }) {
    const { t } = useI18n() as any;

    const ns = useNamespace('field-select-container');

    const searchVal = ref<string>();

    const onSearch = () => {
      emit('search', searchVal.value);
    };

    const onChange = debounce(() => {
      emit('search', searchVal.value);
    }, 500);

    return { t, ns, searchVal, onSearch, onChange };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('header')}>
          <span class={this.ns.be('header', 'left')}>{this.caption}</span>
          <span class={this.ns.be('header', 'right')}>
            <span class={this.ns.be('header', 'count')}>{this.count}</span>
            <span class={this.ns.be('header', 'total')}>/{this.total}</span>
          </span>
        </div>
        <div class={this.ns.b('search')}>
          <a-input
            v-model:value={this.searchVal}
            placeholder={this.t('sys.appDesigner.newViewField.pleaseEnterSearchContent')}
            onChange={this.onChange}
          >
            {{
              suffix: () => {
                return (
                  <i class="iconfont icon-sousuoMedpro leading-none" onClick={this.onSearch}></i>
                );
              },
            }}
          </a-input>
        </div>
        <div class={this.ns.b('content')}>{this.$slots.default?.()}</div>
      </div>
    );
  },
});
