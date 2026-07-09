/* eslint-disable no-inner-declarations */
import { computed, defineComponent, onUnmounted, PropType, ref, watch } from 'vue';
import { useNamespace } from '@gct/runtime';
import { toRefs, useElementBounding, useMutationObserver, useResizeObserver } from '@vueuse/core';
import { maxBy, minBy } from 'lodash-es';
import { IHalfRect, IPosRect } from '../../../interface';
import { useDesignViewController } from '../../../hooks';
import './design-item-highlighter-container.scss';

function getAllScrollParents(element): HTMLElement[] {
  const scrollParents: HTMLElement[] = [];
  let parent = element;

  while ((parent = parent.parentElement)) {
    // 遍历所有祖先元素
    if (
      parent instanceof HTMLElement &&
      (parent.offsetWidth < parent.scrollWidth || parent.offsetHeight < parent.scrollHeight)
    ) {
      // 如果元素的实际宽度小于滚动宽度，或实际高度小于滚动高度，则认为该元素是可以滚动的
      scrollParents.push(parent);
    }
  }

  return scrollParents;
}

export const DesignItemHighlighterContainer = defineComponent({
  name: 'DesignItemHighlighterContainer',
  props: {
    mode: {
      type: String as PropType<'hover' | 'select'>,
      default: 'hover',
    },
    posEl: {
      type: Object as PropType<HTMLDivElement | null>,
      default: null,
    },
    changeHalfRect: {
      type: Function as PropType<(opt: IHalfRect) => void>,
    },
    changePosRect: {
      type: Function as PropType<(opt: IPosRect) => void>,
    },
  },
  setup(props) {
    const ns = useNamespace('design-item-highlighter-container');

    const c = useDesignViewController();

    const { posEl } = toRefs(props);

    const elRect = useElementBounding(posEl);

    useMutationObserver(
      posEl,
      () => {
        changeSorts();
      },
      { attributes: true },
    );

    useResizeObserver(posEl, () => {
      changeSorts();
    });

    const store = c.store;

    // 所有可以滚动的元素
    const scrollEls = ref<HTMLElement[]>([]);

    // 默认遮罩偏移
    const defRect = -2;

    const halfRect = ref<IHalfRect>({
      top: defRect,
      right: defRect,
      bottom: defRect,
      left: defRect,
    });

    const styleConfig = computed(() => {
      if (posEl.value) {
        if (props.changePosRect) {
          props.changePosRect({
            width: elRect.width.value,
            height: elRect.height.value,
            top: elRect.top.value,
            left: elRect.left.value,
            right: elRect.right.value,
            bottom: elRect.bottom.value,
          });
        }
        return {
          display: store.isDragging ? 'none' : 'block',
          width: elRect.width.value + 'px',
          height: elRect.height.value + 'px',
          top: elRect.top.value + 'px',
          left: elRect.left.value + 'px',
        };
      }
      if (props.changePosRect) {
        props.changePosRect({
          width: 0,
          height: 0,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        });
      }
      return {
        display: 'none',
        width: '0',
        height: '0',
        top: '0',
        left: '0',
      };
    });

    const changeSorts = () => {
      if (posEl.value) {
        const oldSorts = [...scrollEls.value];
        scrollEls.value = getAllScrollParents(posEl.value);
        const removeSorts = oldSorts.filter((el) => !scrollEls.value.includes(el));
        const addSorts = scrollEls.value.filter((el) => !oldSorts.includes(el));
        // 取消所有滚动条元素的滚动事件订阅
        removeSorts.forEach((el) => {
          el.removeEventListener('scroll', onScroll);
        });
        addSorts.forEach((el) => {
          el.addEventListener('scroll', onScroll);
        });
        calcHalfRect();
      }
    };

    const calcHalfRect = () => {
      if (scrollEls.value.length > 0 && posEl.value) {
        const rect = posEl.value!.getBoundingClientRect();
        // 计算所有父的最低可视高度
        const topScrollEl = maxBy(scrollEls.value, (el) => el.getBoundingClientRect().top)!;
        const topScrollRect = topScrollEl.getBoundingClientRect();
        const top = rect.top - topScrollRect.top + 4;

        const rightScrollEl = minBy(scrollEls.value, (el) => el.getBoundingClientRect().right)!;
        const rightScrollRect = rightScrollEl.getBoundingClientRect();
        const right = rightScrollRect.right - rect.right + 4;

        const bottomScrollEl = minBy(scrollEls.value, (el) => el.getBoundingClientRect().bottom)!;
        const bottomScrollRect = bottomScrollEl.getBoundingClientRect();
        const bottom = bottomScrollRect.bottom - rect.bottom + 4;

        const leftScrollEl = maxBy(scrollEls.value, (el) => el.getBoundingClientRect().left)!;
        const leftScrollRect = leftScrollEl.getBoundingClientRect();
        const left = rect.left - leftScrollRect.left + 4;

        halfRect.value = {
          top: top >= 0 ? defRect : Math.abs(top),
          right: right >= 0 ? defRect : Math.abs(right),
          bottom: bottom >= 0 ? defRect : Math.abs(bottom),
          left: left >= 0 ? defRect : Math.abs(left),
        };
      } else {
        halfRect.value = {
          top: defRect,
          right: defRect,
          bottom: defRect,
          left: defRect,
        };
      }
      if (props.changeHalfRect) {
        props.changeHalfRect(halfRect.value);
      }
      return halfRect.value;
    };

    function onScroll() {
      calcHalfRect();
    }

    let t: number = -1;
    let an: number = -1;

    watch(posEl, () => {
      changeSorts();
      if (t !== -1) {
        clearTimeout(t);
        t = -1;
      }
      if (an !== -1) {
        cancelAnimationFrame(an);
        an = -1;
      }
      if (posEl.value) {
        // 无法完全覆盖所有元素变化场景，临时使用 setInterval 进行更新
        t = setInterval(() => {
          elRect.update();
        }, 50) as unknown as number;
        an = requestAnimationFrame(() => {
          elRect.update();
        });
      }
    });

    onUnmounted(() => {
      clearInterval(t);
    });

    // 需要计算是上边隐藏 or 下边隐藏 or 全隐藏
    // 选中的时候需要计算一次，有可能本身就是半隐藏状态
    // 还需要考虑横向滚动条
    const styleObj = computed(() => {
      const style = {
        ...styleConfig.value,
        'background-color': store.isDragging || props.mode === 'select' ? 'transparent' : '',
        'clip-path': `inset(${halfRect.value.top}px ${halfRect.value.right}px ${halfRect.value.bottom}px ${halfRect.value.left}px)`,
      };
      return style;
    });

    return { ns, styleObj, calcHalfRect };
  },
  render() {
    return (
      <div style={this.styleObj} class={[this.ns.b(), this.ns.m(this.mode)]}>
        <div class={[this.ns.e('mask')]}></div>
      </div>
    );
  },
});
