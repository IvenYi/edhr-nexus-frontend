import { defineComponent, ref, watch } from 'vue';
import { useNamespace } from '@gct/runtime';

export const CascaderPreview = defineComponent({
  name: 'CascaderPreview',
  props: {
    // 重复触发模式, 1: 小时，2: 日，3: 周，4: 月，5: 年
    mode: [String, Number] as PropType<string | number>,
    value: { type: [Array, Array] as PropType<string[] | string[][]>, default: () => [] },
    options: { type: Array, default: () => [] },
  },
  setup(props) {
    const ns = useNamespace('cascader-preview');

    const list = ref<string[]>([]);

    const calcList = () => {
      const { mode, value, options } = props;
      list.value = [];
      if (value.length > 0 && options.length > 0) {
        const map: any = {};
        const childMap: any = {};
        options.forEach((item: any) => {
          map[item.value] = item.label;
          if (item.children) {
            item.children.forEach((child: any) => {
              if (!childMap[item.value]) {
                childMap[item.value] = {};
              }
              childMap[item.value][child.value] = child.label;
            });
          }
        });
        if (mode === '3') {
          value.forEach((item) => {
            list.value.push(map[item as string]);
          });
        } else if (mode === '4') {
          value.forEach((item) => {
            list.value.push(map[item as string]);
          });
        } else if (mode === '5') {
          value.forEach((item) => {
            const [month, day] = item;
            if (day) {
              const monthMap = childMap[month] as Record<string, string>;
              list.value.push(monthMap[day as string]);
            } else if (month) {
              list.value.push(map[month as string]);
            }
          });
        }
      }
    };

    watch(
      props,
      () => {
        calcList();
      },
      { deep: true },
    );

    calcList();

    return { ns, list };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        {this.list.map((item, i) => {
          return (
            <span key={i} class={this.ns.e('item')}>
              {item}
              {i !== this.list.length - 1 ? '、' : ''}
            </span>
          );
        })}
      </div>
    );
  },
});

export default CascaderPreview;
