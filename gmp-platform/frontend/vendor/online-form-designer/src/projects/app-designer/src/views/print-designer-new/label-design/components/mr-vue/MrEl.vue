<template>
  <div
    data-mr-el="true"
    class="mr-el"
    :class="{ internal: internal, rotDiv: null }"
    :style="style"
    @dblclick="handleDoubleClick()"
    @mousedown.exact.stop="(e) => activatedHandler(e)"
    @mousedown.meta.capture.stop="(e) => activatedHandler(e)"
    @mousedown.ctrl.capture.stop="(e) => activatedHandler(e)"
  >
    <!-- IMPORTANT! KEEP SLOT AS FIRST CHILD -->
    <slot></slot>
    <!-- IMPORTANT! KEEP SLOT AS FIRST CHILD -->
    <div
      v-if="!selectedItem?.isEdit"
      class="mr-mask"
      :class="{ 'mr-active': active, 'mr-hover': avtiveHover }"
    ></div>

    <!--opc 断开显示-->
    <div class="tag-handle" style="display: none">
      <div class="handle-body"></div>
      <i class="font_family icon-ico-dzt" data-mr-rotate="true"></i>
    </div>
    <!-- tag手柄，只有被激活的tag元素才有，拖拽绑定tag时会用到 -->
    <!--<div v-if="tag && active && !internal" class="tag-handle">-->
    <!--<div class="handle-body"></div>-->
    <!--<i class="font_family icon-tag" v-if="tag" />-->
    <!--</div>-->

    <!-- event手柄，只有被激活并且有events属性的元素才有，拖拽绑定event时会用到 -->
    <!-- <div v-if="!!events && active" class="event-handle">
      <i class="font_family icon-event2" data-mr-event="true" />
      <div class="handle-body"></div>
    </div> -->

    <!-- 旋转手柄 -->
    <!-- <div v-if="active && !internal && selectedCnt === 1" class="rotate-handle">
      <i class="font_family icon-rotate" data-mr-rotate="true" />
    </div> -->

    <!-- pageWrap在designer中的默认内容 -->
    <div class="page-wrap-desc" v-if="name === 'pageWrap'">
      <div class="page-wrap-desc_text">
        {{ $t('sys.printDesigner.pageWrapDesc') }}
      </div>
    </div>

    <!-- 选中时边框的类型 -->
    <!-- 可移动、缩放 -->
    <template v-if="resizable">
      <!-- designer中的默认内容,遮挡真实元素，容器组件不渲染 -->
      <!-- <div class="modal-handle">
        <div
          class="moveIcon"
          :class="{
            posTop: isTop,
            // posRotTop: isRot && isTop,
            posBottom: !isTop,
            // posRotBottom: isRot && !isTop,
          }"
          v-show="active"
        >
          <drag-outlined />
        </div>
      </div> -->
      <div
        data-mr-handle="true"
        v-for="handle in handles"
        :key="handle"
        class="handle"
        :class="handle"
        v-show="active"
      ></div>
      <template v-if="elem?.type == 'BAR_CODE'">
        <div
          v-for="(item, index) in unHandles"
          class="unhandle"
          :class="`un-${item}`"
          v-show="active"
          :key="item + index"
        ></div>
      </template>
    </template>
    <!-- 只能被选中，不能缩放和移动 -->
    <template v-else-if="internal">
      <div class="selection-box--internal" v-show="active"></div>
    </template>
    <template v-else>
      <div class="selection-box" v-show="active"></div>
    </template>
  </div>
</template>

<script lang="ts" setup name="mr-el">
  import { useDesigner } from '../../hooks/useDesigner';
  import { computed } from 'vue';
  import { PRINT_ELE_TYPE } from '../../constants/CommonPrintElems';
  import { useProp } from '../../hooks/useProp';

  const {
    selectedElements,
    hoveredElements,
    addSelectedElement,
    clearSelectedElements,
    updateEgglement,
  } = useDesigner();
  const { selectedItem } = useProp();
  const props = defineProps({
    id: {
      type: String,
      default: '',
    },

    name: {
      type: String,
      default: '',
    },
    internal: {
      type: Boolean,
      default: false,
    },
    events: {
      type: Object,
      default: undefined,
    },
    width: {
      type: Number,
      default: undefined,
    },
    height: {
      type: Number,
      default: undefined,
    },
    minWidth: {
      type: Number,
      default: 20,
    },
    minHeight: {
      type: Number,
      default: 20,
    },
    top: {
      type: Number,
      default: 0,
    },
    bottom: {
      type: Number,
      default: undefined,
    },
    left: {
      type: Number,
      default: 0,
    },
    right: {
      type: [String, Number],
      default: 'auto',
    },
    zIndex: {
      type: Number,
      default: undefined,
    },
    rotate: {
      type: Number,
      default: 0,
    },
    handles: {
      type: Array,
      default: function () {
        return ['mt', 'mr', 'mb', 'ml', 'tl', 'tc', 'tr', 'br', 'bc', 'bl', 'lc', 'rc'];
      },
    },
    elem: {
      type: Object,
    },
  });

  const unHandles = computed(() => {
    return props.elem?.type == 'BAR_CODE'
      ? props.elem?.rotate == 90
        ? ['mb', 'mt']
        : ['mr', 'ml']
      : null;
  });

  const active = computed(() => {
    return selectedElements.value.findIndex((el) => el.id === props.id) !== -1;
  });

  const avtiveHover = computed(() => {
    return hoveredElements.value.findIndex((el) => el.id === props.id) !== -1;
  });

  const resizable = computed(() => {
    return props.handles !== null && props.handles.length > 0 && !props.internal;
  });
  /**针对线段需要做一些修正 */
  const elTopNumber = computed(() => {
    let top = parseFloat((props.top || 0) + '');
    if (props?.elem?.type === PRINT_ELE_TYPE.HORIZONTAL_LINE) {
      const { height } = props?.elem;
      top -= height / 2 - 1;
    }
    return top;
  });
  /**针对线段需要做一些修正 */
  const elLeftNumber = computed(() => {
    let left = parseFloat((props.left || 0) + '');
    if (props?.elem?.type === PRINT_ELE_TYPE.VERTICAL_LINE) {
      const { width } = props?.elem;
      left -= width / 2 - 1;
    }
    return left;
  });
  const isTop = computed(() => {
    return elTopNumber.value > 30;
  });
  const style = computed(() => {
    return {
      zIndex: props.zIndex,
      minWidth: props.minWidth + 'px',
      minHeight: props.minHeight + 'px',
      top: elTopNumber.value + 'px',
      left: elLeftNumber.value + 'px',
      bottom: typeof props.bottom === 'number' ? props.bottom + 'px' : props.bottom,
      right: typeof props.right === 'number' ? props.right + 'px' : props.right,
      width: typeof props.width === 'number' ? props.width + 'px' : props.width,
      height: typeof props.height === 'number' ? props.height + 'px' : props.height,
      // transform: this.rotate ? `rotate(${this.rotate}deg)` : "none",
      // transformOrigin: `${parseInt(this.height) / 2}px ${parseInt(
      //   this.height
      // ) / 2}px`,
    };
  });
  const activatedHandler = (e) => {
    // 如果点的同一个元素不做处理
    if (props.elem.id === selectedItem.value.id && selectedItem.value.isEdit) {
      return;
    }
    // 换元素且文本在编辑中，关闭元素编辑状态
    if (selectedItem.value.type === PRINT_ELE_TYPE.TEXT && selectedItem.value.isEdit) {
      updateEgglement({ egglement: selectedItem.value, isEdit: false });
    }

    e.stopPropagation();
    e.preventDefault();
    if (e.shiftKey && active.value) {
      addSelectedElement(props.elem);
    } else if (!e.shiftKey && !active.value) {
      clearSelectedElements();
      addSelectedElement(props.elem);
    }
  };
  const handleDoubleClick = () => {
    if (
      selectedItem.value.type === PRINT_ELE_TYPE.TEXT &&
      selectedItem.value.attrs.text.type === 'FIXED'
    ) {
      updateEgglement({ egglement: selectedItem.value, isEdit: true });
    }
  };
</script>

<style lang="scss" scoped>
  .mr-el {
    position: absolute;
    box-sizing: border-box;
    border: 1px solid transparent;
    // &:hover {
    //   background: rgba(#3168ec, 0.12);
    //   border: 1px dashed #3168ec;
    // }

    .mr-mask {
      position: absolute;
      top: -1px;
      left: -1px;
      width: calc(100% + 2px);
      height: calc(100% + 2px);

      &:hover {
        border: 1px dashed var(--ant-primary-color);
        background: rgb(var(--ant-primary-color) 0.16);
        // background-color: rgba(from var(--ant-primary-color) r g b / 16%);
        background-color: color-mix(in srgb, var(--ant-primary-color) 16%, transparent);
      }

      &.mr-hover {
        border: 1px dashed var(--ant-primary-color);
        background: rgb(var(--ant-primary-color) 0.16);
        // background-color: rgba(from var(--ant-primary-color) r g b / 16%);
        background-color: color-mix(in srgb, var(--ant-primary-color) 16%, transparent);
      }

      &.mr-active {
        &:hover {
          border-color: transparent;
          background: transparent;
        }
      }
    }

    :deep(.icon-next) {
      height: 100%;

      svg {
        width: 100%;
        height: 100%;
      }
    }
  }

  // .mr-el:has(div.modal-handle) {
  //   &:hover {
  //     background: transparent;
  //     border-color: transparent;
  //   }
  // }

  .mr-el .moveIcon {
    position: absolute;
    color: #409eff;
    text-align: center;
  }

  .posTop {
    top: -20px;
    left: 6px;
  }

  .posBottom {
    bottom: -20px;
    left: 6px;
  }

  .posRotTop {
    bottom: 6px;
    left: -20px;
  }

  .posRotBottom {
    right: -20px;
    bottom: 6px;
  }

  .mr-el:hover {
    cursor: move;
  }

  .mr-el.internal:hover {
    cursor: initial;
  }

  .mr-el > * {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    margin: 0;
  }

  .selection-box {
    border: 2px solid var(--ant-primary-color);
  }

  .selection-box--internal {
    border: 2px solid #999;
  }

  .tag-mark {
    position: absolute;
    top: 0;
    left: 0;
    width: 16px;
    height: 16px;
    line-height: 16px;
    text-align: center;
  }

  .tag-val-wrap {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: transparent;
  }

  .tab-list {
    left: -80px;
    width: auto;
    height: auto;
    list-style-type: none;
    border: 1px solid rgb(202 202 202);
    border-right: none;
  }

  .tab-item {
    display: block;
    width: 80px;
    height: 25px;
    color: #666;
    font-size: 12px;
    line-height: 25px;
    text-align: center;
    cursor: pointer;
  }

  .tab-item:not(:first-child) {
    border-top: 1px solid rgb(202 202 202);
  }

  .tab-item:hover {
    background-color: #2473ce;
    color: #fff;
  }

  .tab-item.selected {
    color: #2473ce;
  }

  .handle {
    position: absolute;
    // border-radius: 50%;
    // border: 1px solid #fff;
    z-index: 6;
    box-sizing: border-box;
    width: 8px;
    height: 8px;
    font-size: 1px;
  }

  .tl {
    top: -3px;
    left: -3px;
    background: var(--ant-primary-color);
    cursor: nwse-resize;
  }

  .mt {
    top: 0;
    width: 100%;
    border-width: 2px;
    border-style: solid none none;
    border-radius: 0;
    border-color: var(--ant-primary-color);
    cursor: ns-resize;
  }

  .tr {
    top: -3px;
    right: -3px;
    background: var(--ant-primary-color);
    cursor: nesw-resize;
  }

  .mr {
    top: 0;
    right: 0;
    height: 100%;
    border-width: 2px;
    border-style: none solid none none;
    border-radius: 0;
    border-color: var(--ant-primary-color);
    cursor: ew-resize;
  }

  .br {
    right: -3px;
    bottom: -3px;
    background: var(--ant-primary-color);
    cursor: nwse-resize;
  }

  .mb {
    bottom: 0;
    width: 100%;
    border-width: 2px;
    border-style: none none solid;
    border-radius: 0;
    border-color: var(--ant-primary-color);
    cursor: ns-resize;
  }

  .bl {
    bottom: -3px;
    left: -3px;
    background: var(--ant-primary-color);
    cursor: nesw-resize;
  }

  .ml {
    top: 0;
    left: 0;
    height: 100%;
    border-width: 2px;
    border-style: none none none solid;
    border-radius: 0;
    border-color: var(--ant-primary-color);
    cursor: ew-resize;
  }

  .tc {
    top: -3px;
    left: 50%;
    transform: translate(-50%);
    background: var(--ant-primary-color);
    cursor: ns-resize;
  }

  .bc {
    bottom: -3px;
    left: 50%;
    transform: translate(-50%);
    background: var(--ant-primary-color);
    cursor: ns-resize;
  }

  .lc {
    top: 50%;
    left: -3px;
    transform: translate(0, -50%);
    background: var(--ant-primary-color);
    cursor: ew-resize;
  }

  .rc {
    top: 50%;
    right: -3px;
    transform: translate(0, -50%);
    background: var(--ant-primary-color);
    cursor: ew-resize;
  }

  .unhandle {
    position: absolute;
    z-index: 6;
    box-sizing: border-box;
    width: 8px;
    height: 8px;
    border-width: 2px;
    border-radius: 0;
    border-color: var(--ant-primary-color);
    font-size: 1px;

    &.un-mt {
      top: 0;
      width: 100%;
      border-style: solid none none;
    }

    &.un-mb {
      bottom: 0;
      width: 100%;
      border-style: none none solid;
    }

    &.un-ml {
      top: 0;
      left: 0;
      height: 100%;
      border-style: none none none solid;
    }

    &.un-mr {
      top: 0;
      right: 0;
      height: 100%;
      border-style: none solid none none;
    }
  }

  .rotDiv {
    .tl {
      cursor: nesw-resize;
    }

    .br {
      cursor: nesw-resize;
    }

    .tr {
      cursor: nwse-resize;
    }

    .bl {
      cursor: nwse-resize;
    }

    .mt {
      cursor: ew-resize;
    }

    .mb {
      cursor: ew-resize;
    }

    .mr {
      cursor: ns-resize;
    }

    .ml {
      cursor: ns-resize;
    }
  }

  .page-wrap-desc {
    display: flex;
    align-items: center;
    justify-content: center;

    /* background-color: #dcdcdc; */
  }

  .page-wrap-desc > div {
    width: 80%;
    color: #666;
    text-align: center;

    /* background-color: #dcdcdc; */
  }

  .event-handle {
    display: flex;
    top: 50%;
    left: -30px;
    align-items: center;
    width: 30px;
    height: 10px;
    margin-top: -5px;
  }

  .event-handle .icon-event2 {
    color: #999;
    font-size: 24px;
    cursor: grab;
  }

  .event-handle .handle-body {
    width: 20px;
    height: 2px;
    background-color: #999;
  }

  .tag-handle {
    display: flex;
    top: 50%;
    right: -30px;
    align-items: center;
    width: 30px;
    height: 10px;
    margin-top: -5px;
  }

  .tag-handle i {
    display: block;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: #ff5f5f;
    color: #fff;
    font-size: 13px;
    line-height: 22px;
    text-align: center;
  }

  .tag-handle .handle-body {
    width: 6px;
    height: 2px;
    background-color: #999;
  }

  .rotate-handle {
    top: -36px;
    left: 50%;
    width: 24px;
    height: 24px;
    margin-left: -12px;
    color: var(--ant-primary-color);
    cursor: grab;
  }

  .rotate-handle .icon-rotate {
    font-size: 24px;
  }

  .modal-handle {
    position: static;
    z-index: 5;
    height: 1px;
  }
</style>
