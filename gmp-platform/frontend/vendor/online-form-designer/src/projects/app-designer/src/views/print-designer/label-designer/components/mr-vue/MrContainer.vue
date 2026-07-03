<template>
  <div
    data-mr-container="true"
    :class="['mr-container', { 'mr-container-design': isDesign }]"
    tabindex="0"
    @mousedown.capture="mouseDownHandler"
    @keydown.esc.exact.stop.prevent="emit('clearselection')"
    @keydown.delete.exact.stop.prevent="emit('delete')"
    @keydown.ctrl.c.exact.stop="emit('copy')"
    @keydown.meta.c.exact.stop.prevent="emit('copy')"
    @keydown.ctrl.x.exact.stop.prevent="emit('cut')"
    @keydown.meta.x.exact.stop.prevent="emit('cut')"
    @keydown.ctrl.v.exact.stop.prevent="emit('paste')"
    @keydown.meta.v.exact.stop.prevent="emit('paste')"
    @keydown.ctrl.z.exact.stop.prevent="emit('undo')"
    @keydown.meta.z.exact.stop.prevent="emit('undo')"
    @keydown.ctrl.shift.z.exact.stop.prevent="emit('redo')"
    @keydown.meta.shift.z.exact.stop.prevent="emit('redo')"
    @keydown.up.exact.stop.prevent="
      (e) => emit('arrows', { direction: 'up', shiftKey: e.shiftKey })
    "
    @keydown.down.exact.stop.prevent="
      (e) => emit('arrows', { direction: 'down', shiftKey: e.shiftKey })
    "
    @keydown.left.exact.stop.prevent="
      (e) => emit('arrows', { direction: 'left', shiftKey: e.shiftKey })
    "
    @keydown.right.exact.stop.prevent="
      (e) => emit('arrows', { direction: 'right', shiftKey: e.shiftKey })
    "
    @drop.prevent="(e) => emit('drop', e)"
    @dragover.prevent
  >
    <slot></slot>
    <div ref="selectionArea" v-show="selecting" class="selection-area"></div>
    <div ref="sublineT" v-show="sublineOn" class="subline subline--h"></div>
    <div ref="sublineB" v-show="sublineOn" class="subline subline--h"></div>
    <div ref="sublineY" v-show="sublineOn" class="subline subline--h subline--center"></div>
    <div ref="sublineL" v-show="sublineOn" class="subline subline--v"></div>
    <div ref="sublineR" v-show="sublineOn" class="subline subline--v"></div>
    <div ref="sublineX" v-show="sublineOn" class="subline subline--v subline--center"></div>
  </div>
</template>

<script lang="ts" setup name="mr-container">
  import { computed, nextTick, ref, watch } from 'vue';
  import { snapElems } from '../../helper/snapTracking';
  import { useDesigner } from '../../hooks/useDesigner';

  const { selectedElements } = useDesigner();
  const selectionArea = ref();
  const sublineT = ref();
  const sublineB = ref();
  const sublineY = ref();
  const sublineL = ref();
  const sublineR = ref();
  const sublineX = ref();
  const refObj = {
    sublineT,
    sublineB,
    sublineY,
    sublineL,
    sublineR,
    sublineX,
  };
  const props = defineProps({
    activeElements: {
      type: Array,
      default: () => [],
    },
    snapTracking: {
      type: Boolean,
      default: false,
    },
    zoom: {
      type: Number,
      default: 1,
    },
    isDesign: {
      type: Boolean,
      default: true,
    },
  });
  const emit = defineEmits([
    'clearselection',
    'delete',
    'copy',
    'cut',
    'paste',
    'undo',
    'redo',
    'arrows',
    'drop',
    'resizestop',
    'movestop',
    'rotatestop',
    'selectstop',
    'moving',
    'rotating',
  ]);
  const mrElements = ref<(HTMLElement | null)[]>([]);
  const sublineOn = computed(() => {
    // 只有选中单个元素，并且只在当前父元素内部移动时才会开启对象捕捉。（todo：多选元素以后再考虑）
    return props.snapTracking && mrElements.value.length === 1;
  });
  watch(
    () => selectedElements.value,
    (val) => {
      nextTick(() => {
        mrElements.value = val.map((el) => {
          const htmlEle = document.getElementById(el.id);
          return htmlEle ? htmlEle.parentElement : null;
        });
      });
    },
  );

  const initialAbsPos = ref({ x: 0, y: 0 });
  const initialRelPos = ref({ x: 0, y: 0 });
  const initialAngle = ref(0);
  const currentAbsPos = ref({ x: 0, y: 0 });
  const currentRelPos = ref({ x: 0, y: 0 });
  const currentAngle = ref(0);
  const selecting = ref(false);
  const resizing = ref(false);
  const handle = ref();
  const rotating = ref(false);
  const moving = ref(false);
  const isAttachedH = ref(false); // 元素的左、右边界或中点是否已经吸附到某一条垂直辅助线上导致其水平方向位置锁定
  const isAttachedV = ref(false); // 元素的上、下边界或中点是否已经吸附到某一条水平辅助线上导致其垂直方向位置锁定
  const attachedPoint = ref(); // 吸附瞬间鼠标的位置
  const mouseDownHandler = (e) => {
    let isMrs = false;
    initialAbsPos.value = currentAbsPos.value = getMouseAbsPoint(e);
    initialRelPos.value = currentRelPos.value = getMouseRelPoint(e);
    initialAngle.value = currentAngle.value = getMouseRelAngle(e);
    if (e.target.dataset.mrContainer) {
      emit('clearselection');
      renderSelectionArea({ x: -1, y: -1 }, { x: -1, y: -1 });
      isMrs = selecting.value = true;
    } else if (e.target.dataset.mrHandle) {
      isMrs = resizing.value = true;
      handle.value = e.target.classList[1];
      // this.$emit('resizestart')
    } else if (e.target.dataset.mrRotate) {
      isMrs = rotating.value = true;
    } else if (getParentMr(e.target)) {
      const hasIntegrated = props.activeElements.some((ele) => ele.internal);
      if (!hasIntegrated) {
        isMrs = moving.value = true;
      }
    }

    if (isMrs) {
      document.documentElement.addEventListener('mousemove', mouseMoveHandler, true);
      document.documentElement.addEventListener('mouseup', mouseUpHandler, true);
    }
  };
  const getMouseAbsPoint = (e) => {
    return { x: e.clientX, y: e.clientY };
  };
  const getMouseRelPoint = (e) => {
    const mainContainer = document.querySelector('.designer-canvas');
    const maineggRect = document.querySelector('.mr-container-design')!.getBoundingClientRect();
    const x = e.clientX + mainContainer!.scrollLeft - maineggRect.left;
    const y = e.clientY + mainContainer!.scrollTop - maineggRect.top;

    return { x, y };
  };
  /**
   * 鼠标位置和选中的元素的中心位置间的夹角
   */
  const getMouseRelAngle = (e) => {
    if (mrElements.value.length !== 1) return;
    let { left, top, width, height } = window.getComputedStyle(mrElements.value[0] as HTMLElement);

    const centerX = parseInt(left) + parseInt(width) / 2;
    const centerY = parseInt(top) + parseInt(height) / 2;
    const { x, y } = getMouseRelPoint(e);
    const angle = (180 / Math.PI) * Math.atan2(y - centerY, x - centerX);
    return angle;
  };

  const renderSelectionArea = (initPoint, endPoint) => {
    const minX = Math.min(initPoint.x, endPoint.x);
    const maxX = Math.max(initPoint.x, endPoint.x);
    const minY = Math.min(initPoint.y, endPoint.y);
    const maxY = Math.max(initPoint.y, endPoint.y);

    selectionArea.value.style.left = Math.round(minX / props.zoom) + 'px';
    selectionArea.value.style.top = Math.round(minY / props.zoom) + 'px';
    selectionArea.value.style.width = Math.round((maxX - minX) / props.zoom) + 'px';
    selectionArea.value.style.height = Math.round((maxY - minY) / props.zoom) + 'px';
  };
  const getParentMr = (element) => {
    let parentMr = null;
    let currentMr = element;

    while (parentMr === null) {
      if (currentMr === null || currentMr.parentElement === null) break;
      else if (currentMr.dataset.mrContainer) parentMr = currentMr;
      else if (currentMr.parentElement.dataset.mrEl) parentMr = currentMr.parentElement;

      currentMr = currentMr.parentElement;
    }
    return parentMr;
  };
  const mouseMoveHandler = (e) => {
    const lastAbsX = currentAbsPos.value.x;
    const lastAbsY = currentAbsPos.value.y;

    currentAbsPos.value = getMouseAbsPoint(e);
    currentRelPos.value = getMouseRelPoint(e);
    currentAngle.value = getMouseRelAngle(e);

    let offX = currentAbsPos.value.x - lastAbsX;
    let offY = currentAbsPos.value.y - lastAbsY;
    let offAngle = currentAngle.value - initialAngle.value;
    if (resizing.value) {
      if (e.shiftKey) {
        // 按住shift等比例缩放
        if (Math.abs(offX) >= Math.abs(offY)) {
          offY = offY >= 0 ? Math.abs(offX) : -Math.abs(offX);
        } else {
          offX = offX >= 0 ? Math.abs(offY) : -Math.abs(offY);
        }
      }
      if (sublineOn.value) {
        resizeToSubline(mrElements.value[0], currentRelPos.value);
        mrElements.value.map((mrEl) => {
          resizeElementBy(mrEl, isAttachedH.value ? 0 : offX, isAttachedV.value ? 0 : offY);
        });
      } else {
        mrElements.value.map((mrEl) => {
          resizeElementBy(mrEl, offX, offY);
        });
      }
    } else if (moving.value) {
      if (sublineOn.value) {
        moveToSubline(mrElements.value[0], currentRelPos.value);
        mrElements.value.map((mrEl) =>
          moveElementBy(mrEl, isAttachedH.value ? 0 : offX, isAttachedV.value ? 0 : offY),
        );
      } else {
        mrElements.value.map((mrEl) => moveElementBy(mrEl, offX, offY));
      }
      emit('moving', currentAbsPos.value.x, currentAbsPos.value.y);
    } else if (rotating.value) {
      mrElements.value.map((mrEl) => rotateElementBy(mrEl, offAngle));
      emit('rotating', currentAngle.value);
    } else {
      renderSelectionArea(initialRelPos.value, currentRelPos.value);
      // this.$emit('selecting')
    }
  };
  const mouseUpHandler = () => {
    // Saves the scroll position before giving focus and sets it back after focus
    const mainContainer = document.querySelector('.designer-canvas')!;
    let currentScroll = mainContainer.scrollTop;
    (document.querySelector('.mr-container-design') as HTMLElement)?.focus();
    mainContainer.scrollTop = currentScroll;

    if (initialAbsPos.value !== currentAbsPos.value) {
      console.log(moving.value, resizing.value, rotating.value, selecting.value);
      if (resizing.value) emit('resizestop', resizeStopData());
      else if (moving.value) emit('movestop', moveStopData());
      else if (rotating.value) emit('rotatestop', rotateStopData());
      else if (selecting.value) emit('selectstop', selectStopData());
    }

    moving.value = false;
    resizing.value = false;
    rotating.value = false;
    selecting.value = false;
    handle.value = null;

    document.documentElement.removeEventListener('mousemove', mouseMoveHandler, true);
    document.documentElement.removeEventListener('mouseup', mouseUpHandler, true);

    resetSubline();
    isAttachedH.value = false;
    isAttachedV.value = false;
  };
  const resizeStopData = () => {
    return mrElements.value.map((el) => {
      return {
        elId: el.children[0].id,
        top:
          el.style.top.indexOf('%') !== -1 || el.style.top === 'auto'
            ? el.style.top
            : parseInt(el.style.top),
        left:
          el.style.left.indexOf('%') !== -1 || el.style.left === 'auto'
            ? el.style.left
            : parseInt(el.style.left),
        bottom:
          el.style.bottom.indexOf('%') !== -1 || el.style.bottom === 'auto'
            ? el.style.bottom
            : parseInt(el.style.bottom),
        right:
          el.style.right.indexOf('%') !== -1 || el.style.right === 'auto'
            ? el.style.right
            : parseInt(el.style.right),
        height:
          el.style.height.indexOf('%') !== -1 || el.style.height === 'auto'
            ? el.style.height
            : parseInt(el.style.height),
        width:
          el.style.width.indexOf('%') !== -1 || el.style.width === 'auto'
            ? el.style.width
            : parseInt(el.style.width),
      };
    });
  };
  const moveStopData = () => {
    return {
      moveElData: mrElements.value.map((el) => {
        return {
          elId: el.children[0].id,
          top:
            el.style.top.indexOf('%') !== -1 || el.style.top === 'auto'
              ? el.style.top
              : parseInt(el.style.top),
          left:
            el.style.left.indexOf('%') !== -1 || el.style.left === 'auto'
              ? el.style.left
              : parseInt(el.style.left),
          bottom:
            el.style.bottom.indexOf('%') !== -1 || el.style.bottom === 'auto'
              ? el.style.bottom
              : parseInt(el.style.bottom),
          right:
            el.style.right.indexOf('%') !== -1 || el.style.right === 'auto'
              ? el.style.right
              : parseInt(el.style.right),
        };
      }),
      relMouseX: Math.round(currentRelPos.value.x / props.zoom),
      relMouseY: Math.round(currentRelPos.value.y / props.zoom),
      absMouseX: currentAbsPos.value.x,
      absMouseY: currentAbsPos.value.y,
    };
  };
  const rotateStopData = () => {
    return mrElements.value.map((el) => {
      const rotStr = el.style.webkitTransform;
      const tempArr = rotStr.match(/\((\S*)deg/);
      return {
        elId: el.children[0].id,
        rotate: Array.isArray(tempArr) ? parseFloat(parseFloat(tempArr[1]).toFixed()) : 0,
      };
    });
  };
  const selectStopData = () => {
    return {
      top: parseInt(selectionArea.value.style.top),
      bottom: parseInt(selectionArea.value.style.height) + parseInt(selectionArea.value.style.top),
      left: parseInt(selectionArea.value.style.left),
      right: parseInt(selectionArea.value.style.width) + parseInt(selectionArea.value.style.left),
    };
  };
  /**
   * 复位所有的辅助线
   */
  const resetSubline = () => {
    const sublineArray = ['L', 'R', 'X', 'T', 'B', 'Y'];
    for (let subline of sublineArray) {
      showHideSubline(0, subline, false);
    }
  };
  /**
   * 显示或隐藏辅助线
   * @param coor 位置
   * @param pos L R T B X Y
   * @param visible 显示还是隐藏
   */
  const showHideSubline = (coor, pos, visible) => {
    const subline = refObj['subline' + pos].value;
    if (subline) {
      if (visible) {
        if (['L', 'R', 'X'].indexOf(pos) > -1) {
          subline.style.left = coor + 'px';
          subline.style.display = 'block';
        } else if (['T', 'B', 'Y'].indexOf(pos) > -1) {
          subline.style.top = coor + 'px';
          subline.style.display = 'block';
        } else return;
      } else {
        subline.style.display = 'none';
      }
    }
  };
  // 缩放元素时展现并吸附至辅助线
  const resizeToSubline = (el, currentPoint) => {
    const elCompStyle = window.getComputedStyle(el);
    const width = parseInt(elCompStyle.width);
    const height = parseInt(elCompStyle.height);
    const top = parseInt(elCompStyle.top);
    const left = parseInt(elCompStyle.left);
    const right = parseInt(left + width);
    const bottom = parseInt(top + height);
    if (handle.value.indexOf('l') !== -1) {
      if (!isAttachedH.value) {
        for (let i = 0; i < snapElems.length; i++) {
          const { l, r } = snapElems[i];
          if (Math.abs(l - left) < 5) {
            showHideSubline(l, 'L', true);
            mrElements.value.map((mrEl) => resizeElementBy(mrEl, l - left, 0));
            isAttachedH.value = true;
            attachedPoint.value = currentPoint;
            break;
          }
          if (Math.abs(r - left) < 5) {
            showHideSubline(r, 'L', true);
            mrElements.value.map((mrEl) => resizeElementBy(mrEl, r - left, 0));
            isAttachedH.value = true;
            attachedPoint.value = currentPoint;
            break;
          }
        }
      } else {
        if (Math.abs(currentPoint.x - attachedPoint.value.x) > 5) {
          mrElements.value.map((mrEl) =>
            resizeElementBy(mrEl, currentPoint.x - attachedPoint.value.x, 0),
          );
          isAttachedH.value = false;
          // this.attachedPoint = {x: 0, y: 0};
          resetSubline();
        }
      }
    }

    if (handle.value.indexOf('r') !== -1) {
      if (!isAttachedH.value) {
        for (let i = 0; i < snapElems.length; i++) {
          const { l, r } = snapElems[i];
          if (Math.abs(l - right) < 5) {
            showHideSubline(l, 'R', true);
            mrElements.value.map((mrEl) => resizeElementBy(mrEl, l - right, 0));
            isAttachedH.value = true;
            attachedPoint.value = currentPoint;
            break;
          }
          if (Math.abs(r - right) < 5) {
            showHideSubline(r, 'R', true);
            mrElements.value.map((mrEl) => resizeElementBy(mrEl, r - right, 0));
            isAttachedH.value = true;
            attachedPoint.value = currentPoint;
            break;
          }
        }
      } else {
        if (Math.abs(currentPoint.x - attachedPoint.value.x) > 5) {
          mrElements.value.map((mrEl) =>
            resizeElementBy(mrEl, currentPoint.x - attachedPoint.value.x, 0),
          );
          isAttachedH.value = false;
          // this.attachedPoint = {x: 0, y: 0};
          resetSubline();
        }
      }
    }

    if (handle.value.indexOf('t') !== -1) {
      if (!isAttachedV.value) {
        for (let i = 0; i < snapElems.length; i++) {
          const { t, b } = snapElems[i];
          if (Math.abs(t - top) < 5) {
            showHideSubline(t, 'T', true);
            mrElements.value.map((mrEl) => resizeElementBy(mrEl, 0, t - top));
            isAttachedV.value = true;
            attachedPoint.value = currentPoint;
            break;
          }
          if (Math.abs(b - top) < 5) {
            showHideSubline(b, 'T', true);
            mrElements.value.map((mrEl) => resizeElementBy(mrEl, 0, b - top));
            isAttachedV.value = true;
            attachedPoint.value = currentPoint;
            break;
          }
        }
      } else {
        if (Math.abs(currentPoint.y - attachedPoint.value.y) > 5) {
          mrElements.value.map((mrEl) =>
            resizeElementBy(mrEl, 0, currentPoint.y - attachedPoint.value.y),
          );
          isAttachedV.value = false;
          // this.attachedPoint = {x: 0, y: 0};
          resetSubline();
        }
      }
    }

    if (handle.value.indexOf('b') !== -1) {
      if (!isAttachedV.value) {
        for (let i = 0; i < snapElems.length; i++) {
          const { t, b } = snapElems[i];
          if (Math.abs(t - bottom) < 5) {
            showHideSubline(t, 'B', true);
            mrElements.value.map((mrEl) => resizeElementBy(mrEl, 0, t - bottom));
            isAttachedV.value = true;
            attachedPoint.value = currentPoint;
            break;
          }
          if (Math.abs(b - bottom) < 5) {
            showHideSubline(b, 'B', true);
            mrElements.value.map((mrEl) => resizeElementBy(mrEl, 0, b - bottom));
            isAttachedV.value = true;
            attachedPoint.value = currentPoint;
            break;
          }
        }
      } else {
        if (Math.abs(currentPoint.y - attachedPoint.value.y) > 5) {
          mrElements.value.map((mrEl) =>
            resizeElementBy(mrEl, 0, currentPoint.y - attachedPoint.value.y),
          );
          isAttachedV.value = false;
          // this.attachedPoint = {x: 0, y: 0};
          resetSubline();
        }
      }
    }
  };
  const resizeElementBy = (el, offX, offY) => {
    const parentCompStyle = window.getComputedStyle(getParentMr(el));
    const elCompStyle = window.getComputedStyle(el);

    const parentH = parseInt(parentCompStyle.height);
    const parentW = parseInt(parentCompStyle.width);
    const elMinH = parseInt(elCompStyle.minHeight);
    const elMinW = parseInt(elCompStyle.minWidth);

    let newTop = parseInt(elCompStyle.top);
    let newLeft = parseInt(elCompStyle.left);
    let newRight = parseInt(elCompStyle.right);
    let newBottom = parseInt(elCompStyle.bottom);
    let newHeight = parseInt(elCompStyle.height);
    let newWidth = parseInt(elCompStyle.width);

    let diffX = offX;
    let diffY = offY;
    // const mrEl = props.activeElements[0];

    if (handle.value.indexOf('t') !== -1) {
      if (newHeight - offY < elMinH) diffY = newHeight - elMinH;
      else if (newTop + offY < 0) diffY = 0 - newTop;
      newTop += Math.round(diffY / props.zoom);
      newHeight -= Math.round(diffY / props.zoom);
    }
    if (handle.value.indexOf('l') !== -1) {
      if (newWidth - offX < elMinW) diffX = newWidth - elMinW;
      else if (newLeft + offX < 0) diffX = 0 - newLeft;
      newLeft += Math.round(diffX / props.zoom);
      newWidth -= Math.round(diffX / props.zoom);
    }
    if (handle.value.indexOf('b') !== -1) {
      if (newHeight + offY < elMinH) diffY = elMinH - newHeight;
      else if (newTop + newHeight + offY > parentH) diffY = parentH - newTop - newHeight;
      newHeight += Math.round(diffY / props.zoom);
      newBottom -= Math.round(diffY / props.zoom);
    }
    if (handle.value.indexOf('r') !== -1) {
      if (newWidth + offX < elMinW) diffX = elMinW - newWidth;
      else if (newLeft + newWidth + offX > parentW) diffX = parentW - newLeft - newWidth;
      newWidth += Math.round(diffX / props.zoom);
      newRight -= Math.round(diffX / props.zoom);
    }

    el.style.height =
      el.style.height !== 'auto'
        ? el.style.height.indexOf('%') > -1
          ? (newHeight / parentH) * 100 + '%'
          : newHeight + 'px' //修改百分比
        : 'auto';
    el.style.width =
      el.style.width !== 'auto'
        ? el.style.width.indexOf('%') > -1
          ? (newWidth / parentW) * 100 + '%'
          : newWidth + 'px'
        : 'auto';
    el.style.top =
      el.style.top !== 'auto'
        ? el.style.top.indexOf('%') > -1
          ? (newTop / parentH) * 100 + '%'
          : newTop + 'px'
        : 'auto';
    el.style.left =
      el.style.left !== 'auto'
        ? el.style.left.indexOf('%') > -1
          ? (newLeft / parentW) * 100 + '%'
          : newLeft + 'px'
        : 'auto';
    el.style.bottom =
      el.style.bottom !== 'auto'
        ? el.style.bottom.indexOf('%') > -1
          ? (newBottom / parentH) * 100 + '%'
          : newBottom + 'px'
        : 'auto';
    el.style.right =
      el.style.right !== 'auto'
        ? el.style.right.indexOf('%') > -1
          ? (newRight / parentW) * 100 + '%'
          : newRight + 'px'
        : 'auto';
  };
  // 移动元素时展现并吸附至辅助线
  const moveToSubline = (el, currentPoint) => {
    const elCompStyle = window.getComputedStyle(el);
    const width = parseInt(elCompStyle.width);
    const height = parseInt(elCompStyle.height);
    const top = parseInt(elCompStyle.top);
    const left = parseInt(elCompStyle.left);
    const right = parseInt(left + width);
    const bottom = parseInt(top + height);
    const centerX = Math.round((left + right) / 2);
    const centerY = Math.round((top + bottom) / 2);
    if (!isAttachedH.value) {
      for (let i = 0; i < snapElems.length; i++) {
        const { l, r, t, b, x, y } = snapElems[i];
        if (Math.abs(l - left) < 5) {
          showHideSubline(l, 'L', true);
          mrElements.value.map((mrEl) => moveElementBy(mrEl, l - left, 0));
          isAttachedH.value = true;
          attachedPoint.value = currentPoint;
          if (l - left === x - centerX) {
            showHideSubline(x, 'X', true);
          }
          if (l - left === r - right) {
            showHideSubline(r, 'R', true);
          }
          break;
        } else if (Math.abs(r - left) < 5) {
          showHideSubline(r, 'L', true);
          mrElements.value.map((mrEl) => moveElementBy(mrEl, r - left, 0));
          isAttachedH.value = true;
          attachedPoint.value = currentPoint;
          break;
        } else if (Math.abs(r - right) < 5) {
          showHideSubline(r, 'R', true);
          mrElements.value.map((mrEl) => moveElementBy(mrEl, r - right, 0));
          isAttachedH.value = true;
          attachedPoint.value = currentPoint;
          if (r - right === x - centerX) {
            showHideSubline(x, 'X', true);
          }
          if (r - right === l - left) {
            showHideSubline(l, 'L', true);
          }
          break;
        } else if (Math.abs(l - right) < 5) {
          showHideSubline(l, 'R', true);
          mrElements.value.map((mrEl) => moveElementBy(mrEl, l - right, 0));
          isAttachedH.value = true;
          attachedPoint.value = currentPoint;
          break;
        } else if (Math.abs(x - centerX) < 5) {
          showHideSubline(x, 'X', true);
          mrElements.value.map((mrEl) => moveElementBy(mrEl, x - centerX, 0));
          isAttachedH.value = true;
          attachedPoint.value = currentPoint;
          if (x - centerX === r - right) {
            showHideSubline(r, 'R', true);
          }
          if (x - centerX === l - left) {
            showHideSubline(l, 'L', true);
          }
          break;
        }
      }
    } else {
      if (Math.abs(currentPoint.x - attachedPoint.value.x) > 5) {
        mrElements.value.map((mrEl) =>
          moveElementBy(mrEl, currentPoint.x - attachedPoint.value.x, 0),
        );
        isAttachedH.value = false;
        // this.attachedPoint = {x: 0, y: 0};
        resetSubline();
      }
    }

    if (!isAttachedV.value) {
      for (let i = 0; i < snapElems.length; i++) {
        const { l, r, t, b, x, y } = snapElems[i];
        if (Math.abs(t - top) < 5) {
          showHideSubline(t, 'T', true);
          mrElements.value.map((mrEl) => moveElementBy(mrEl, 0, t - top));
          isAttachedV.value = true;
          attachedPoint.value = currentPoint;
          if (t - top === y - centerY) {
            showHideSubline(y, 'Y', true);
          }
          if (t - top === b - bottom) {
            showHideSubline(b, 'B', true);
          }
          break;
        } else if (Math.abs(b - top) < 5) {
          showHideSubline(b, 'T', true);
          mrElements.value.map((mrEl) => moveElementBy(mrEl, 0, b - top));
          isAttachedV.value = true;
          attachedPoint.value = currentPoint;
          break;
        } else if (Math.abs(b - bottom) < 5) {
          showHideSubline(b, 'B', true);
          mrElements.value.map((mrEl) => moveElementBy(mrEl, 0, b - bottom));
          isAttachedV.value = true;
          attachedPoint.value = currentPoint;
          if (b - bottom === y - centerY) {
            showHideSubline(y, 'Y', true);
          }
          if (b - bottom === t - top) {
            showHideSubline(t, 'T', true);
          }
          break;
        } else if (Math.abs(t - bottom) < 5) {
          showHideSubline(t, 'B', true);
          mrElements.value.map((mrEl) => moveElementBy(mrEl, 0, t - bottom));
          isAttachedV.value = true;
          attachedPoint.value = currentPoint;
          break;
        } else if (Math.abs(y - centerY) < 5) {
          showHideSubline(y, 'Y', true);
          mrElements.value.map((mrEl) => moveElementBy(mrEl, 0, y - centerY));
          isAttachedV.value = true;
          attachedPoint.value = currentPoint;
          if (y - centerY === b - bottom) {
            showHideSubline(b, 'B', true);
          }
          if (y - centerY === t - top) {
            showHideSubline(t, 'T', true);
          }
          break;
        }
      }
    } else {
      if (Math.abs(currentPoint.y - attachedPoint.value.y) > 5) {
        mrElements.value.map((mrEl) =>
          moveElementBy(mrEl, 0, currentPoint.y - attachedPoint.value.y),
        );
        isAttachedV.value = false;
        // this.attachedPoint = {x: 0, y: 0};
        resetSubline();
      }
    }
  };
  const moveElementBy = (el, offX, offY) => {
    const elCompStyle = window.getComputedStyle(el);
    const parentCompStyle = window.getComputedStyle(getParentMr(el));

    const parentH = parseInt(parentCompStyle.height);
    const parentW = parseInt(parentCompStyle.width);
    // Re-set height and width on move to preserve dimensions (due addition of bottom/right props)
    // el.style.height = el.style.height;
    // el.style.width = el.style.width;
    //修改百分比
    const newTop = fixPosition(
      el,
      parseInt(elCompStyle.top) + Math.round(offY / props.zoom),
      'top',
    );
    const newLeft = fixPosition(
      el,
      parseInt(elCompStyle.left) + Math.round(offX / props.zoom),
      'left',
    );
    const newBottom = fixPosition(
      el,
      parseInt(elCompStyle.bottom) - Math.round(offY / props.zoom),
      'bottom',
    );
    const newRight = fixPosition(
      el,
      parseInt(elCompStyle.right) - Math.round(offX / props.zoom),
      'right',
    );

    el.style.top =
      el.style.top !== 'auto'
        ? el.style.top.indexOf('%') > -1
          ? (newTop / parentH) * 100 + '%'
          : newTop + 'px'
        : 'auto';
    el.style.left =
      el.style.left !== 'auto'
        ? el.style.left.indexOf('%') > -1
          ? (newLeft / parentW) * 100 + '%'
          : newLeft + 'px'
        : 'auto';
    el.style.bottom =
      el.style.bottom !== 'auto'
        ? el.style.bottom.indexOf('%') > -1
          ? (newBottom / parentH) * 100 + '%'
          : newBottom + 'px'
        : 'auto';
    el.style.right =
      el.style.right !== 'auto'
        ? el.style.right.indexOf('%') > -1
          ? (newRight / parentW) * 100 + '%'
          : newRight + 'px'
        : 'auto';
  };
  const fixPosition = (el, val, prop) => {
    if (val < 0) return 0;

    const parentCompStyle = window.getComputedStyle(getParentMr(el));
    const elCompStyle = window.getComputedStyle(el);
    // const mrEl = this.activeElements[0]
    // if (mrEl.rotate === 90) {
    //   //旋转90度后 边界计算
    //   const distance = parseInt(mrEl.width) - parseInt(mrEl.height)
    //   if (
    //     (prop === "top" || prop === "bottom") &&
    //     val + parseInt(elCompStyle.height) + distance >
    //       parseInt(parentCompStyle.height)
    //   ) {
    //     return (
    //       parseInt(parentCompStyle.height) -
    //       parseInt(elCompStyle.height) -
    //       distance
    //     )
    //   }
    //   if (
    //     (prop === "left" || prop === "right") &&
    //     val + parseInt(elCompStyle.width) - distance >
    //       parseInt(parentCompStyle.width)
    //   ) {
    //     return (
    //       parseInt(parentCompStyle.width) -
    //       parseInt(elCompStyle.width) +
    //       distance
    //     )
    //   }
    // } else {

    // }
    if (
      (prop === 'top' || prop === 'bottom') &&
      val + parseInt(elCompStyle.height) > parseInt(parentCompStyle.height)
    ) {
      return parseInt(parentCompStyle.height) - parseInt(elCompStyle.height);
    }
    if (
      (prop === 'left' || prop === 'right') &&
      val + parseInt(elCompStyle.width) > parseInt(parentCompStyle.width)
    ) {
      return parseInt(parentCompStyle.width) - parseInt(elCompStyle.width);
    }
    return val;
  };
  const rotateElementBy = (el, offAngle) => {
    const mrEl = props.activeElements[0];
    const elRotate = parseInt(mrEl.rotate);

    el.style.webkitTransform = 'rotate(' + (elRotate + offAngle) + 'deg)';
    // const { top, left, width, height } = el.style;
    // const centerX = parseInt(left) + parseInt(width) / 2;
    // const centerY = parseInt(top) + parseInt(height) / 2;

    // const currentAngle =
    //   (180 / Math.PI) *
    //   Math.atan2(currentRelY - centerY, currentRelX - centerX);
    // const rotate = currentAngle - this.startAngle;
    // el.style.webkitTransform =
    //   'rotate(' + (this.initialAngle + rotate) + 'deg)';
  };
</script>

<style scoped>
  .mr-container {
    position: relative;
    margin: 10px auto !important;
    outline: none;
  }

  .selection-area {
    position: absolute;
    border: 1px solid #03a9f4;
    background-color: rgb(3 169 244 / 8%);
  }

  .subline {
    display: none;
    position: absolute;
    z-index: 999;
    background-color: rgb(235 66 250);
  }

  .subline--h {
    left: 0;
    width: 100%;
    height: 1px;
  }

  .subline--v {
    top: 0;
    width: 1px;
    height: 100%;
  }

  .subline--center {
    background-color: rgb(0 247 255);
  }
</style>
