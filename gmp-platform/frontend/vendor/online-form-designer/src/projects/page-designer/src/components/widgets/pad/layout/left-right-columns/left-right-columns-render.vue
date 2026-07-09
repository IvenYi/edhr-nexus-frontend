<template>
  <div ref="layout" class="h-full">
    <div class="flex h-full" :style="style">
      <!-- left -->
      <div
        v-show="!collapsed"
        class="shrink-0 relative"
        :class="{ 'overflow-y-auto': hasHeight }"
        :style="{ width: leftWidth, ...childStyle }"
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
                  '2px solid var(--van-primary-color)',
              }
            : undefined
        "
      >
        <!-- hot zone: Web 预览时使用 mousedown，Pad 中使用 touchstart -->
        <zone
          v-if="resizable"
          class="absolute z-10 top-0 left-0 -ml-3 w-6 h-full cursor-col-resize _bg-black/5"
          @mousedown="(e) => (_isAndroid ? undefined : handleDragLineMove(e))"
          @touchstart="(e) => (_isAndroid ? handleDragLineMove(e) : undefined)"
        />
        <!-- arrow indicator -->
        <div
          v-if="collapsable"
          class="flex justify-center items-center absolute z-20 top-1/2 left-0 -translate-y-1/2 w-4 h-15 rounded-full text-white cursor-pointer bg-[#868a96cc]"
          :class="[
            isColumnTypeRight ? 'rotate-180' : '', // 靠右旋转180°
            collapsed
              ? isColumnTypeRight
                ? '-translate-x-[18px]' // 靠右 18px: 宽 16 + 间隔 2
                : 'translate-x-[2px]' // 靠左 2px: 间隔 2
              : '-translate-x-1/2', // 居中
          ]"
          :style="{ marginLeft: `${isColumnTypeRight ? '+' : '-'}0.5px` }"
          @click="handleCollapsed"
        >
          <i
            class="icon gct-iconfont icon-Pad-zhankaishouqifenlan"
            :class="{ 'rotate-180': collapsed }"
            style="font-size: 10px"
          ></i>
        </div>
      </div>

      <!-- right -->
      <div class="ks-col relative" :class="{ 'overflow-y-auto': hasHeight }" :style="childStyle">
        <slot :children="rightLayout"></slot>
      </div>
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
  import { _isAndroid } from '@mobile/utils/const';

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

  const { start, moveDomDown, moveMobileDomDown } = UseDragByLine(rowWidth || 0, columnType.value!);
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
    return {
      color: 'red',
      height: height.value
        ? height.value + 'px'
        : clientHeight.value
          ? clientHeight.value + 'px'
          : undefined,
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

  const hasHeight = computed(() => !!props.widget?.style?.height);

  const handleDragLineMove = async (e) => {
    if (!resizable?.value) return;
    if (columnType.value === COLUMNS_TYPE.CENTER) {
      start.value = layout.value.offsetWidth / 2;
      columnType.value = COLUMNS_TYPE.LEFT;
    }

    isDragging.value = true;

    if (_isAndroid) {
      // Pad
      moveMobileDomDown(e, layout.value, () => {
        isDragging.value = false;
      });
    } else {
      // Web 预览
      moveDomDown(e, layout.value, () => {
        isDragging.value = false;
      });
    }
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
    // while (!el.classList.contains('root')) {
    //   el = el.parentNode;
    // }
    // const parentHeight = el.getBoundingClientRect().height;
    // const parentNodeHeight = el.parentNode?.getBoundingClientRect().height;
    // height.value =
    //   props.widget?.style?.height ||
    //   (parentHeight && parentHeight < 60 ? 60 : parentHeight) ||
    //   (parentNodeHeight < 60 ? 60 : parentNodeHeight);
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
