import { defineComponent, PropType } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { openPopover, PopoverInstance } from '../../gct-v-table-popover/gct-v-table-popover';
import { FederatedPointerEvent } from '@visactor/vtable/es/vrender';
import { GctVTableLongTextProps } from '../../../interface';
import './gct-v-table-long-text.scss';

export const GctVTableLongText = defineComponent({
  name: 'GctVTableLongText',
  props: {
    val: {
      type: String as PropType<GctVTableLongTextProps['val']>,
      default: '',
    },
  },
  setup(props) {
    const ns = useNamespace('v-table-long-text');

    return () => {
      return <div class={ns.b()}>{props.val}</div>;
    };
  },
});

/**
 * 展示图片列表弹窗
 *
 * @export
 * @param {FederatedPointerEvent} e
 * @param {GctVTableLongTextProps['val']} val
 * @return {*}  {PopoverInstance}
 */
export function openVTableLongText(
  e: FederatedPointerEvent,
  val: GctVTableLongTextProps['val'],
): PopoverInstance {
  const { x, y } = e.page;
  return openPopover(GctVTableLongText, { val }, { x, y, maxWidth: 400, maxHeight: 312 });
}
