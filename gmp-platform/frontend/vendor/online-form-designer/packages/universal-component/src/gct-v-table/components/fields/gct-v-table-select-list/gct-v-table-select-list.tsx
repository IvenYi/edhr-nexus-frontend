import { defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { FederatedPointerEvent } from '@visactor/vtable/es/vrender';
import { openPopover, PopoverInstance } from '../../gct-v-table-popover/gct-v-table-popover';
import { GctVTableSelectListProps } from '../../../interface';
import { GctVTableSelectListItemElement } from './gct-v-table-select-list-item';
import './gct-v-table-select-list.scss';

export const GctVTableSelectList = defineComponent({
  name: 'GctVTableSelectList',
  props: {
    items: {
      type: Array as PropType<GctVTableSelectListProps['items']>,
      default: () => [],
    },
    maxTextLength: {
      type: Number as PropType<GctVTableSelectListProps['maxTextLength']>,
      default: 12,
    },
  },
  setup(props) {
    const ns = useNamespace('v-table-select-list');

    return () => {
      return (
        <div class={ns.b()}>
          {props.items.map((item, index) => (
            <GctVTableSelectListItemElement key={index} item={item} />
          ))}
        </div>
      );
    };
  },
});

/**
 * 展示选择列表弹窗
 *
 * @export
 * @param {FederatedPointerEvent} e
 * @param {GctVTableSelectListProps['items']} val
 * @return {*}  {PopoverInstance}
 */
export function openVTableSelectList(
  e: FederatedPointerEvent,
  val: GctVTableSelectListProps['items'],
): PopoverInstance {
  const { x, y } = e.page;
  return openPopover(GctVTableSelectList, { items: val }, { x, y, maxWidth: 400, maxHeight: 312 });
}
