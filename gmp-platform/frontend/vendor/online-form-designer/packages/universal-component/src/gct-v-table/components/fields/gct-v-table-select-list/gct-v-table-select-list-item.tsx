import { computed, defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { GctVTableSelectListProps } from '../../../interface';
import './gct-v-table-select-list-item.scss';

export const GctVTableSelectListItemElement = defineComponent({
  name: 'GctVTableSelectListItem',
  props: {
    item: {
      type: Object as PropType<GctVTableSelectListProps['items'][0]>,
      required: true,
    },
    maxTextLength: {
      type: Number as PropType<GctVTableSelectListProps['maxTextLength']>,
      default: 12,
    },
  },
  setup(props) {
    const ns = useNamespace('v-table-select-list-item');

    const truncateText = computed(() => {
      const text = props.item.label;
      const maxLength: number = props.maxTextLength || 12;
      if (!text || text.length <= maxLength) {
        return text;
      }
      return text.substring(0, maxLength) + '...';
    });

    const icon = computed(() => {
      return props.item.icon?.replace(/(width|height)="[^"]*"/g, '');
    });

    function renderIcon() {
      return icon.value ? <span class={ns.e('item-icon')} v-html={icon.value}></span> : null;
    }

    function renderText(text: string) {
      return <span class={ns.e('item-text')}>{text}</span>;
    }

    return () => {
      return (
        <div class={ns.b()}>
          {renderIcon()}
          {renderText(truncateText.value)}
        </div>
      );
    };
  },
});
