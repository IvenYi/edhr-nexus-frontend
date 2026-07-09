<template>
  <div
    data-mr-el="true"
    class="mr-el"
    :class="{ internal: internal, rotDiv: null }"
    :style="style"
    @mousedown.exact.stop="(e) => activatedHandler(e)"
    @mousedown.meta.capture.stop="(e) => activatedHandler(e)"
    @mousedown.ctrl.capture.stop="(e) => activatedHandler(e)"
  >
    <!-- IMPORTANT! KEEP SLOT AS FIRST CHILD -->
    <slot></slot>
    <!-- IMPORTANT! KEEP SLOT AS FIRST CHILD -->

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
        该区域无法直接编辑，请在页面列表中点击前往相应的子页面编辑内容。
      </div>
    </div>

    <!-- 选中时边框的类型 -->
    <!-- 可移动、缩放 -->
    <template v-if="resizable">
      <!-- designer中的默认内容,遮挡真实元素，容器组件不渲染 -->
      <div class="modal-handle">
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
      </div>
      <div
        data-mr-handle="true"
        v-for="handle in handles"
        :key="handle"
        class="handle"
        :class="handle"
        v-show="active"
      ></div>
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
  import { useDesigner } from '/@app-designer/views/print-designer/label-designer/hooks/useDesigner';
  import { computed } from 'vue';

  const { selectedElements, addSelectedElement, clearSelectedElements } = useDesigner();
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
        return ['mt', 'mr', 'mb', 'ml', 'tl', 'tr', 'br', 'bl'];
      },
    },
    elem: {
      type: Object,
    },
  });
  const active = computed(() => {
    return selectedElements.value.findIndex((el) => el.id === props.id) !== -1;
  });
  const resizable = computed(() => {
    return props.handles !== null && props.handles.length > 0 && !props.internal;
  });
  const isTop = computed(() => {
    let top = typeof props.top === 'number' ? props.top : props.top.split('px')[0];
    return top > 30;
  });
  const style = computed(() => {
    return {
      zIndex: props.zIndex,
      minWidth: props.minWidth + 'px',
      minHeight: props.minHeight + 'px',
      top: typeof props.top === 'number' ? props.top + 'px' : props.top,
      left: typeof props.left === 'number' ? props.left + 'px' : props.left,
      bottom: typeof props.bottom === 'number' ? props.bottom + 'px' : props.bottom,
      right: typeof props.right === 'number' ? props.right + 'px' : props.right,
      width: typeof props.width === 'number' ? props.width + 'px' : props.width,
      height: typeof props.height === 'number' ? props.height + 4 + 'px' : props.height,
      // transform: this.rotate ? `rotate(${this.rotate}deg)` : "none",
      // transformOrigin: `${parseInt(this.height) / 2}px ${parseInt(
      //   this.height
      // ) / 2}px`,
    };
  });
  const activatedHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.shiftKey && active.value) {
      addSelectedElement(props.elem);
    } else if (!e.shiftKey && !active.value) {
      clearSelectedElements();
      addSelectedElement(props.elem);
    }
  };
</script>

<style lang="scss" scoped>
  .mr-el {
    position: absolute;
    box-sizing: border-box;
  }

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
    left: -20px;
    bottom: 6px;
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
    margin: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    box-sizing: border-box;
  }

  .selection-box {
    border: 2px solid #03a9f4;
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
    text-align: center;
    line-height: 16px;
  }

  .tag-val-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    background-color: transparent;
  }

  .tab-list {
    width: auto;
    height: auto;
    left: -80px;
    list-style-type: none;
    border: 1px solid rgb(202, 202, 202);
    border-right: none;
  }

  .tab-item {
    width: 80px;
    height: 25px;
    line-height: 25px;
    display: block;
    text-align: center;
    cursor: pointer;
    font-size: 12px;
    color: #666;
  }

  .tab-item:not(:first-child) {
    border-top: 1px solid rgb(202, 202, 202);
  }

  .tab-item:hover {
    background-color: #2473ce;
    color: #fff;
  }

  .tab-item.selected {
    color: #2473ce;
  }

  .handle {
    box-sizing: border-box;
    position: absolute;
    width: 10px;
    height: 10px;
    font-size: 1px;
    border-radius: 50%;
    border: 1px solid #fff;
    z-index: 6;
  }

  .tl {
    top: -3px;
    left: -3px;
    cursor: nwse-resize;
    background: #03a9f4;
  }

  .mt {
    top: 0;
    width: 100%;
    border-radius: 0;
    border-width: 2px;
    border-color: #03a9f4;
    border-style: solid none none none;
    cursor: ns-resize;
  }

  .tr {
    top: -3px;
    right: -3px;
    cursor: nesw-resize;
    background: #03a9f4;
  }

  .mr {
    top: 0;
    right: 0;
    height: 100%;
    border-radius: 0;
    border-width: 2px;
    border-color: #03a9f4;
    border-style: none solid none none;
    cursor: ew-resize;
  }

  .br {
    bottom: -3px;
    right: -3px;
    cursor: nwse-resize;
    background: #03a9f4;
  }

  .mb {
    bottom: 0;
    width: 100%;
    border-radius: 0;
    border-width: 2px;
    border-color: #03a9f4;
    border-style: none none solid none;
    cursor: ns-resize;
  }

  .bl {
    bottom: -3px;
    left: -3px;
    cursor: nesw-resize;
    background: #03a9f4;
  }

  .ml {
    top: 0;
    left: 0;
    height: 100%;
    border-radius: 0;
    border-width: 2px;
    border-color: #03a9f4;
    border-style: none none none solid;
    cursor: ew-resize;
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
    /*background-color: #dcdcdc;*/
  }

  .page-wrap-desc > div {
    width: 80%;
    text-align: center;
    color: #666;
    /*background-color: #dcdcdc;*/
  }

  .event-handle {
    display: flex;
    align-items: center;
    width: 30px;
    height: 10px;
    top: 50%;
    left: -30px;
    margin-top: -5px;
  }

  .event-handle .icon-event2 {
    font-size: 24px;
    color: #999;
    cursor: -webkit-grab;
  }

  .event-handle .handle-body {
    width: 20px;
    height: 2px;
    background-color: #999;
  }

  .tag-handle {
    display: flex;
    align-items: center;
    width: 30px;
    height: 10px;
    top: 50%;
    right: -30px;
    margin-top: -5px;
  }

  .tag-handle i {
    font-size: 13px;
    display: block;
    background-color: #ff5f5f;
    color: #fff;
    border-radius: 50%;
    width: 22px;
    height: 22px;
    line-height: 22px;
    text-align: center;
  }

  .tag-handle .handle-body {
    width: 6px;
    height: 2px;
    background-color: #999;
  }

  .rotate-handle {
    width: 24px;
    height: 24px;
    top: -36px;
    left: 50%;
    margin-left: -12px;
    color: #03a9f4;
    cursor: -webkit-grab;
  }

  .rotate-handle .icon-rotate {
    font-size: 24px;
  }

  .modal-handle {
    z-index: 5;
    position: static;
    height: 1px;
  }
</style>
