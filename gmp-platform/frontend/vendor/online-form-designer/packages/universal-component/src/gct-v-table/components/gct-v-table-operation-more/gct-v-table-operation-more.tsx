import { defineComponent, PropType } from 'vue';
import { GctVTableOperationMoreElement, IVTableActionItem } from '../../interface';
import { useNamespace, ButtonSize } from '@gct/runtime';
import { getIconParkSvg } from '../../utils';
import { FederatedPointerEvent } from '@visactor/vtable/es/vrender';
import { openPopover, PopoverInstance } from '../gct-v-table-popover/gct-v-table-popover';
import './gct-v-table-operation-more.scss';

export const GctVTableOperationMore = defineComponent({
  name: 'GctVTableOperationMore',
  props: {
    actions: {
      type: Array as PropType<GctVTableOperationMoreElement['actions']>,
      default: () => [],
    },
    onItemClick: {
      type: Function as PropType<GctVTableOperationMoreElement['onItemClick']>,
    },
  },
  setup(props) {
    const ns = useNamespace('v-table-operation-more');

    async function onClick(action: IVTableActionItem): Promise<void> {
      props.onItemClick?.(action);
    }

    function getFontSize(size) {
      const sizeMap = {
        [ButtonSize.SMALL]: 13,
        [ButtonSize.DEFAULT]: 15,
        [ButtonSize.LARGE]: 17,
      };
      return sizeMap[size] || 15;
    }

    function renderActionItem(action: IVTableActionItem) {
      return (
        <div
          class={ns.e('item')}
          style={{
            backgroundColor: action.bgColor,
            color: action.color,
            fontSize: getFontSize(action.size) + 'px',
            height: (getFontSize(action.size) + 1) * 2 + 'px',
          }}
          onClick={() => onClick(action)}
        >
          <span
            class={ns.e('item-icon')}
            style={{
              width: getFontSize(action.size) + 'px',
              height: getFontSize(action.size) + 'px',
            }}
            v-html={getIconParkSvg(action.icon!)}
          ></span>
          <span class={ns.e('item-text')}>{action.text}</span>
        </div>
      );
    }

    return () => {
      return (
        <div class={ns.b()}>
          {props.actions.map((action) => {
            return renderActionItem(action);
          })}
        </div>
      );
    };
  },
});

/**
 * 展示操作列
 *
 * @export
 * @param {FederatedPointerEvent} e
 * @param {GctVTableOperationMoreElement['actions']} actions
 * @param {GctVTableOperationMoreElement['onItemClick']} click
 * @return {*}  {PopoverInstance}
 */
export function openVTableOperationMore(
  e: FederatedPointerEvent,
  actions: GctVTableOperationMoreElement['actions'],
  click: GctVTableOperationMoreElement['onItemClick'],
): PopoverInstance {
  const { x, y } = e.page;
  const popoverEl = openPopover(
    GctVTableOperationMore,
    {
      actions,
      onItemClick: (action: IVTableActionItem) => {
        popoverEl.dismiss();
        click(action);
      },
    },
    { x, y, maxWidth: 400, maxHeight: 312 },
  );
  return popoverEl;
}
