import { reactive, Ref, watch } from 'vue';
import { ResizeDirection } from '../enums';

interface ILayout {
  width: number;
  height: number;
  top: number;
  left: number;
}

interface IOptions {
  getXPoints?: () => number[];
  getYPoints?: () => number[];
  allowLeave?: boolean; // 默认true
  disabled?: boolean;
}

/**
 * 拖拽吸附阈值
 */
const ThresholdValue = 8;

/**
 * 获取吸附点位
 * @param left
 * @param width
 * @param points
 * @returns
 */
function getOffsetValue(left: number, width: number, points: number[]): number {
  let offset = left;
  const leftOffsetArr = points.map((item) => {
    return {
      point: item,
      type: 'left',
      distance: Math.abs(left - item),
    };
  });
  const rightOffsetArr = points.map((item) => {
    return {
      point: item,
      type: 'right',
      distance: Math.abs(left + width - item),
    };
  });

  const offsetArrSorted = [...leftOffsetArr, ...rightOffsetArr].sort((a, b) => {
    const delta = a.distance - b.distance;
    if (delta && a.type === 'left' && b.type === 'right') {
      return -1;
    }
    return delta;
  });

  if (offsetArrSorted[0].distance <= ThresholdValue) {
    if (offsetArrSorted[0].type === 'left') {
      offset = offsetArrSorted[0].point;
    } else {
      offset = offsetArrSorted[0].point - width;
    }
  }
  return offset;
}

/**
 * 判断并返回范围内的值
 * @param range
 * @param value
 * @returns
 */
function getRangedValue(range: [number, number], value: number): number {
  if (value < range[0]) return range[0];
  if (value > range[1]) return range[1];
  return value;
}

/**
 * useDraggable
 * @param el
 * @param initialLayout
 * @returns
 */
export function useDraggable(
  el: Ref<HTMLElement | null>,
  initialLayout: ILayout,
  options?: IOptions,
) {
  const layout: ILayout = reactive(initialLayout);

  function setLayout(key: keyof ILayout, value: number) {
    layout[key] = value;
  }

  function move(e: MouseEvent) {
    const allowLeave = options?.allowLeave ?? true;
    const { left, top, width, height } = layout;
    const { width: containerWidth, height: containerHeight } =
      e.currentTarget!.parentNode.getBoundingClientRect();

    // x方向吸附点位
    const xPoints = options?.getXPoints
      ? [0, ...options.getXPoints(), containerWidth]
      : [0, containerWidth];
    // y方向吸附点位
    const yPoints = options?.getYPoints
      ? [0, ...options.getYPoints(), containerHeight]
      : [0, containerHeight];

    // 计算鼠标相对于拖拽元素的偏移值
    const offsetX = e.clientX - left;
    const offsetY = e.clientY - top;

    function onMouseMove(e2) {
      const left = e2.clientX - offsetX;
      const top = e2.clientY - offsetY;

      // 设置拖拽元素的新位置
      Object.assign(layout, {
        left: allowLeave
          ? getOffsetValue(left, width, xPoints)
          : getRangedValue([0, containerWidth - width], getOffsetValue(left, width, xPoints)),
        top: allowLeave
          ? getOffsetValue(top, height, yPoints)
          : getRangedValue([0, containerHeight - height], getOffsetValue(top, height, yPoints)),
      });
    }

    // 鼠标松开事件
    function onMouseUp() {
      // 移除鼠标移动和松开事件监听
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    // 添加鼠标移动和松开事件监听
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function resize(e) {
    const { left, top, width, height } = layout;
    const ele = e.target as HTMLElement;
    const classList = ele.classList;

    const x1 = e.clientX;
    const y1 = e.clientY;
    function onMouseMove(e2) {
      // 计算拖拽元素的新位置
      const x2 = e2.clientX;
      const y2 = e2.clientY;

      if (classList.contains(ResizeDirection.N)) {
        Object.assign(layout, {
          top: top + (y2 - y1),
          height: height - (y2 - y1),
        });
      } else if (classList.contains(ResizeDirection.NE)) {
        Object.assign(layout, {
          top: top + (y2 - y1),
          height: height - (y2 - y1),
          width: width + x2 - x1,
        });
      } else if (classList.contains(ResizeDirection.E)) {
        Object.assign(layout, {
          width: width + x2 - x1,
        });
      } else if (classList.contains(ResizeDirection.SE)) {
        Object.assign(layout, {
          width: width + x2 - x1,
          height: height + y2 - y1,
        });
      } else if (classList.contains(ResizeDirection.S)) {
        Object.assign(layout, {
          height: height + y2 - y1,
        });
      } else if (classList.contains(ResizeDirection.SW)) {
        Object.assign(layout, {
          width: width - (x2 - x1),
          left: left + (x2 - x1),
          height: height + y2 - y1,
        });
      } else if (classList.contains(ResizeDirection.W)) {
        Object.assign(layout, {
          left: left + (x2 - x1),
          width: width - (x2 - x1),
        });
      } else if (classList.contains(ResizeDirection.NW)) {
        Object.assign(layout, {
          width: width - (x2 - x1),
          left: left + (x2 - x1),
          height: height - (y2 - y1),
          top: top + (y2 - y1),
        });
      }
    }
    // 鼠标松开事件
    function onMouseUp() {
      // 移除鼠标移动和松开事件监听
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    // 添加鼠标移动和松开事件监听
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  watch(
    el,
    (val) => {
      if (!val) return;
      if (options?.disabled) return;

      val.addEventListener('mousedown', (e) => {
        e.preventDefault(); // 阻止默认事件，避免选中文本等默认行为

        const targetEle = e.target as HTMLElement;
        console.log(targetEle);
        if (targetEle.classList.contains('drag-box__move')) {
          move(e);
        } else if (targetEle.classList.contains('drag-box_resize')) {
          resize(e);
        } else if (targetEle.tagName === 'IMG') {
          move(e);
        } else if (targetEle.tagName === 'I') {
          resize(e);
        }
      });
    },
    {
      immediate: true,
    },
  );

  return {
    layout,
    setLayout,
  };
}
