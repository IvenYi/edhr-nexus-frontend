import { computed, defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct/runtime';
import { Search } from '/@/projects/page-designer/src/types/mobile';
import './search-design2.scss';
import { initFieldWidgetRuntime } from '/@page-designer/hooks/getFieldSchema';
import { forEachRight } from 'lodash-es';
export const SearchDesign2 = defineComponent({
  name: 'SearchDesign2',
  props: {
    widget: {
      type: Object as PropType<Search>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('search-design2');

    const t = window.$t;

    const children = computed(() => {
      forEachRight(props.widget.children, (item, index) => {
        initFieldWidgetRuntime(item, true)
          .then((fieldInfo) => {
            item.alias = item.props.label || fieldInfo?.name;
          })
          .catch((err) => {
            //通过倒序遍历删除 不存在的字段
            props.widget.children.splice(index, 1);
          });
      });
      return props.widget.children || [];
    });

    return { ns, t, children };
  },
  render() {
    const config = { direction: 'horizontal', type: 'search-design' };
    return this.$slots.default?.({
      props: {
        class: [this.ns.b(), 'widget-drag'],
        dragPlaceholder:
          !this.widget.props.model && !this.children.length
            ? this.t('sys.pageDesigner.selectAssociatedModel')
            : !this.children.length
            ? this.t('sys.pageDesigner.selectFilterItem')
            : '',
      },
      parentWidget: this.widget,
      children: this.children,
      config,
      itemContent: this.$slots.content,
    });
  },
});
