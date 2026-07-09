import { computed, defineComponent, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import { DesignItemHighlighterContainer } from '../design-item-highlighter-container/design-item-highlighter-container';
import { DesignItemActions } from '../design-item-actions/design-item-actions';
import { DesignItemHoverTitle } from '../design-item-hover-title/design-item-hover-title';
import { DesignItemAttribute } from '../../../constant';
import { IHalfRect, IPosRect } from '../../../interface';
import { useDesignViewController } from '../../../hooks';
import './design-item-highlighter.scss';

/**
 * 组件暴露的属性
 *
 * @export
 * @interface DesignItemHighlighterBinding
 */
export interface DesignItemHighlighterBinding {
  /**
   * 样式命名空间
   *
   * @author zhanghanrui
   * @date 2024-07-11 15:07:36
   * @type {ReturnType<typeof useNamespace>}
   */
  ns: ReturnType<typeof useNamespace>;
  /**
   * 是否已经激活
   *
   * @author zhanghanrui
   * @date 2024-07-11 15:07:42
   * @type {boolean}
   */
  isHover: boolean;
  /**
   * 是否已经有选中
   *
   * @author zhanghanrui
   * @date 2024-07-11 15:07:49
   * @type {boolean}
   */
  isSelect: boolean;
  /**
   * 设置 hover 元素
   *
   * @author zhanghanrui
   * @date 2024-07-11 15:07:49
   */
  setHover: (el?: HTMLElement) => void;
  /**
   * 设置激活态的元素
   *
   * @author zhanghanrui
   * @date 2024-07-11 15:07:20
   */
  setSelect: (el?: HTMLElement) => void;
}

export const DesignItemHighlighter = defineComponent({
  name: 'DesignItemHighlighter',
  components: {
    DesignItemHighlighterContainer,
  },
  setup(_) {
    const ns = useNamespace('design-item-highlighter');

    const c = useDesignViewController();

    const store = c.store;

    const rootRef = ref<HTMLDivElement | null>(null);

    const isHover = ref<boolean>(false);

    const isSelect = ref<boolean>(false);

    const hoverEl = ref<HTMLDivElement | null>(null);

    const selectEl = ref<HTMLDivElement | null>(null);

    const hoverRect = ref<IPosRect>({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: 0,
      height: 0,
    });

    const selectRect = ref<IPosRect>({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: 0,
      height: 0,
    });

    // 默认遮罩偏移
    const defRect = -2;

    const hoverHalfRect = ref<IHalfRect>({
      top: defRect,
      right: defRect,
      bottom: defRect,
      left: defRect,
    });

    const actionHalfRect = ref<IHalfRect>({
      top: defRect,
      right: defRect,
      bottom: defRect,
      left: defRect,
    });

    const setHover = (el?: HTMLElement) => {
      if (el && selectEl.value !== el) {
        isHover.value = true;
        hoverEl.value = el as HTMLDivElement;
      } else {
        isHover.value = false;
        hoverEl.value = null;
      }
    };

    const setSelect = (el?: HTMLElement) => {
      if (el) {
        if (el === hoverEl.value) {
          // 如果 hover 元素和选中元素相同，则取消 hover
          isHover.value = false;
          hoverEl.value = null;
        }
        isSelect.value = true;
        selectEl.value = el as HTMLDivElement;
      } else {
        isSelect.value = false;
        selectEl.value = null;
      }
    };

    const hoverWidgetName = computed<string>(() => {
      return hoverEl.value?.getAttribute(DesignItemAttribute.DESIGN_NAME) || '';
    });

    function onChangeHoverHalfRect(rect: IHalfRect): void {
      hoverHalfRect.value = rect;
    }

    function onChangeActionHalfRect(rect: IHalfRect): void {
      actionHalfRect.value = rect;
    }

    function onChangeHoverPosRect(rect: IPosRect): void {
      hoverRect.value = rect;
    }

    function onChangeSelectPosRect(rect: IPosRect): void {
      selectRect.value = rect;
    }

    return {
      ns,
      store,
      rootRef,
      isHover,
      isSelect,
      hoverEl,
      selectEl,
      hoverRect,
      selectRect,
      setHover,
      setSelect,
      hoverWidgetName,
      hoverHalfRect,
      actionHalfRect,
      onChangeHoverHalfRect,
      onChangeActionHalfRect,
      onChangeHoverPosRect,
      onChangeSelectPosRect,
    };
  },
  render() {
    return (
      <div
        ref="rootRef"
        class={[
          this.ns.b(),
          this.ns.is('dragging', this.store.isDragging),
          this.ns.is('hidden', this.isHover !== true && this.isSelect !== true),
        ]}
      >
        <DesignItemHoverTitle
          v-show={
            this.hoverRect &&
            this.hoverWidgetName &&
            this.selectEl != this.hoverEl &&
            this.store.isDragging !== true
          }
          top={this.hoverRect.top}
          left={this.hoverRect.left + this.hoverRect.width}
          content={this.hoverWidgetName}
          halfRect={this.hoverHalfRect}
          hoverEl={this.hoverEl!}
        />
        <DesignItemActions
          selectEl={this.selectEl!}
          class={[this.ns.e('actions'), this.ns.is('show', !!this.selectRect)]}
          top={this.selectRect.top}
          left={this.selectRect.left + this.selectRect.width}
          halfRect={this.actionHalfRect}
        />
        <DesignItemHighlighterContainer
          ref="hoverRef"
          posEl={this.hoverEl}
          changeHalfRect={this.onChangeHoverHalfRect}
          changePosRect={this.onChangeHoverPosRect}
        />
        <DesignItemHighlighterContainer
          ref="selectRef"
          posEl={this.selectEl}
          mode="select"
          changeHalfRect={this.onChangeActionHalfRect}
          changePosRect={this.onChangeSelectPosRect}
        />
      </div>
    );
  },
});
