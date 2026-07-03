<template>
  <div ref="layout" class="flex h-full" :style="style">
    <!-- left side -->
    <div
      :style="{ width: leftWidth, ...childStyle }"
      class="left-right-columns-side shrink-0 relative overflow-y-auto"
      v-show="!collapsed"
      ref="leftColRef"
    >
      <slot :children="leftLayout"></slot>
    </div>

    <!-- drag line -->
    <div
      class="relative border-[#e0e3eb]"
      :class="
        collapsable && collapsed ? '' : isColumnTypeRight ? 'border-r-solid' : 'border-l-solid'
      "
      :style="
        isDragging
          ? {
              [isColumnTypeRight ? 'borderRight' : 'borderLeft']:
                '2px solid var(--ant-primary-color)',
            }
          : undefined
      "
    >
      <!-- hot zone -->
      <zone
        v-if="resizable"
        class="absolute z-10 top-0 left-0 -ml-2 w-4 h-full cursor-col-resize _bg-black/5"
        @mousedown="handleDragLineMouseDown"
      />
      <!-- arrow indicator -->
      <div
        v-if="collapsable"
        class="arrow-indicator flex justify-center items-center absolute z-20 top-1/2 left-0 -translate-y-1/2 text-white cursor-pointer"
        :class="{ 'is-column-type-right rotate-180': isColumnTypeRight }"
        @mousedown.stop
        @click="handleCollapsed"
      >
        <LeftOutlined :class="{ 'rotate-180': collapsed }" style="font-size: 10px" />
      </div>
    </div>

    <!-- right main -->
    <div class="left-right-columns-main ks-col relative overflow-y-auto" :style="childStyle">
      <slot :children="rightLayout"></slot>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-left-right-columns">
  import { computed, nextTick, onMounted, reactive, ref } from 'vue';
  import { LayoutColumns } from '/@page-designer/types/web';
  import { COLUMNS_TYPE } from '/@page-designer/enum';
  import { UseDragByLine } from '/@page-designer/components/widgets/hooks/useDragLine';
  import { isNil } from 'lodash-es';
  import { ILeftRightColumnsComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const props = defineProps<{ widget: LayoutColumns }>();
  const {
    defaultRowputAway: defaultCollapsed,
    rowputAway: collapsable,
    rowwidth: rowWidth,
  } = reactive(props.widget.props);

  const layout = ref();
  const height = ref(0);
  const isDragging = ref(false);
  const collapsed = ref(!!defaultCollapsed);
  const columnType = ref(props.widget.props.rowtype);
  const leftColRef = ref();
  const clientHeight = ref(0);

  const { start, moveDomDown } = UseDragByLine(rowWidth || 0, columnType.value!);
  const { children } = reactive(props.widget);

  const leftLayout = children?.[0].children || [];
  const rightLayout = children?.[1].children || [];

  const resizable = computed(() => {
    return props.widget.props.rowresize && !collapsed.value;
  });

  const isColumnTypeRight = computed(() => columnType.value === COLUMNS_TYPE.RIGHT);

  const leftWidth = computed(() => {
    if (collapsed.value) return '10px';
    return columnType.value === COLUMNS_TYPE.CENTER ? '50%' : start.value + 'px';
  });

  const style = computed(() => {
    const styleProp = props.widget.style;
    return {
      height: height.value
        ? height.value + 'px'
        : clientHeight.value
          ? clientHeight.value + 'px'
          : undefined,
      backgroundColor: styleProp.backgroundColor || '#fff',
      flexDirection: isColumnTypeRight.value ? 'row-reverse' : 'row',
    };
  });

  const childStyle = computed(() => {
    const styleProp = props.widget.style;
    return {
      paddingTop: (styleProp.paddingTop || 0) + 'px',
      paddingBottom: (styleProp.paddingBottom || 0) + 'px',
      paddingLeft: (styleProp.paddingLeft || 0) + 'px',
      paddingRight: (styleProp.paddingRight || 0) + 'px',
      backgroundColor: styleProp.backgroundColor || '#fff',
    };
  });

  const handleDragLineMouseDown = async (e) => {
    if (!resizable?.value) return;
    if (columnType.value === COLUMNS_TYPE.CENTER) {
      start.value = layout.value.offsetWidth / 2;
      columnType.value = COLUMNS_TYPE.LEFT;
    }
    isDragging.value = true;
    moveDomDown(e, layout.value, () => {
      isDragging.value = false;
    });
  };

  const handleCollapsed = () => {
    if (!collapsed.value) {
      clientHeight.value = leftColRef.value?.clientHeight || 0;
    }
    collapsed.value = !collapsed.value;
  };

  onMounted(async () => {
    await nextTick();
    // let el = layout.value.parentNode;
    // while (!el?.classList?.contains('root')) {
    //   el = el.parentNode;
    // }
    // height.value = document.body.clientHeight - el.getBoundingClientRect().top - 40;
    height.value = Number(props.widget?.style?.height) || 0;
  });

  defineExpose<ILeftRightColumnsComponentExpose>({
    changeSidebar(show) {
      if (isNil(show)) {
        collapsed.value = !collapsed.value;
      } else {
        collapsed.value = !show;
      }
    },
  });
</script>

<style lang="less" scoped>
  /* 预留滚动条槽位，避免 overflow-y-auto 在出现滚动条时挤占宽度导致跳动；min-height:0 让 flex 子项在限定高度内正确滚动 */
  .left-right-columns-side,
  .left-right-columns-main {
    min-height: 0;
    scrollbar-gutter: stable;
  }

  .arrow-indicator {
    width: 14px;
    height: 26px;
    background: #cfcfd2;

    &.is-column-type-right {
      margin-left: -14px;
    }

    &::before,
    &::after {
      content: '';
      position: absolute;
      top: -12px;
      left: 0;
      width: 12px;
      height: 12px;
      background: radial-gradient(circle at 100% 0, transparent 12px, #cfcfd2 12px);
    }

    &::after {
      top: unset;
      bottom: -12px;
      background: radial-gradient(circle at 100% 100%, transparent 12px, #cfcfd2 12px);
    }

    &:hover {
      background: #b4b5b9;

      &::before {
        background: radial-gradient(circle at 100% 0, transparent 12px, #b4b5b9 12px);
      }

      &::after {
        background: radial-gradient(circle at 100% 100%, transparent 12px, #b4b5b9 12px);
      }
    }
  }
</style>
