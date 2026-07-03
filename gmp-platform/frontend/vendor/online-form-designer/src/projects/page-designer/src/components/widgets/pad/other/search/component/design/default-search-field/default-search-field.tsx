import { computed, defineComponent } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { FIELD_TYPE, transformField2Component } from '@gct/runtime';
import { isString } from 'lodash-es';
import './default-search-field.scss';

export const DefaultSearchField = defineComponent({
  name: 'DefaultSearchField',
  props: {
    label: {
      type: [String, Array] as PropType<string | Array<string>>,
    },
    type: {
      type: String as PropType<FIELD_TYPE>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('default-search-field');

    const showLabel = computed(() => {
      let showMsg = props.label ?? '';
      // 设计模式，如果没有传入label，则去拉取样例文本
      if (!showMsg || showMsg.length <= 0) {
        // 获取样例文本
        const example = props.type ? transformField2Component(props.type).example : '';
        // 样例文本转为国际化文本
        showMsg = example ? (isString(example) ? $t(example) : example.map((e) => $t(e))) : '';
      }
      if (showMsg instanceof Array) {
        return showMsg.join('，');
      } else {
        return showMsg + '';
      }
    });

    return () => {
      return (
        <div class={ns.b()}>
          <span class={ns.e('text')}>{showLabel.value}</span>
        </div>
      );
    };
  },
});
