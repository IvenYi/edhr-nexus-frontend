<template>
  <div ref="layout" class="flex h-full overflow-y-auto" :style="style">
    <div
      :style="{ width: leftWidth, ...childStyle }"
      :class="[
        'shrink-0',
        'left-wrap',
        { 'columns-shadow': collapsable, 'is-reversed': isReversed },
      ]"
    >
      <slot
        :key="widget.id + '_left'"
        :groupId="widget.id + '_left'"
        :parentWidget="widget"
        :children="widget.children?.[0].children"
        :config="{ direction: 'horizontal' }"
      ></slot>
    </div>
    <div
      class="dragline relative h-full border-r-solid border-[#e0e3eb]"
      :class="[resizable && 'cursor-col-resize']"
    >
      <div
        v-show="collapsable"
        class="flex justify-center items-center absolute z-20 top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-15 rounded-full text-white cursor-pointer bg-[#868a96cc]"
        :class="{ 'rotate-180': rowType === COLUMNS_TYPE.RIGHT }"
        :style="{ marginLeft: '0.5px' }"
      >
        <i class="icon gct-iconfont icon-Pad-zhankaishouqifenlan" style="font-size: 10px"></i>
      </div>
    </div>
    <div
      :class="['ks-col', 'overflow-hidden', 'right-wrap', { 'is-reversed': isReversed }]"
      :style="childStyle"
    >
      <slot
        :key="widget.id + '_right'"
        :groupId="widget.id + '_right'"
        :parentWidget="widget"
        :children="widget.children?.[1].children"
        :config="{ direction: 'horizontal' }"
      ></slot>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-left-right-columns">
  import { computed, ref, onMounted, nextTick, toRefs } from 'vue';
  import { LayoutColumns } from '/@page-designer/types/web';
  import { COLUMNS_TYPE } from '/@page-designer/enum';

  const props = defineProps<{ widget: LayoutColumns; isNewDesigner: boolean }>();

  const {
    rowtype: rowType,
    rowresize: resizable,
    rowputAway: collapsable,
  } = toRefs(props.widget.props);

  const layout = ref();
  const height = ref(0);

  const leftWidth = computed(() => {
    return rowType!.value === COLUMNS_TYPE.CENTER ? '50%' : props.widget.props.rowwidth + 'px';
  });

  const isReversed = computed(() => {
    return rowType!.value === COLUMNS_TYPE.RIGHT;
  });

  const style = computed(() => {
    return {
      height: height.value + 'px',
      flexDirection: isReversed.value ? 'row-reverse' : 'row',
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

  onMounted(async () => {
    await nextTick();
    let el = layout.value.parentNode;
    while (!el.classList.contains('root')) {
      el = el.parentNode;
    }
    if (el.classList.contains('modal-body')) {
      height.value = el.clientHeight - 36;
    } else {
      height.value = el.getBoundingClientRect().height;
    }
  });
</script>

<style lang="less" scoped>
  .left-wrap {
    position: relative;

    &.is-empty {
      &::before {
        content: attr(data-placeholder);
        display: flex;
        position: absolute;
        align-items: center;
        justify-content: center;
        background-color: #f9f9f9;
        color: #bfbfbf;
        font-size: 16px;
        pointer-events: none;
        inset: 0;
      }
    }

    :deep(.gct-vue3-dnd-container) {
      border-right-width: 0;
    }

    &.is-reversed {
      :deep(.gct-vue3-dnd-container) {
        border-right-width: 2px;
        border-left-width: 0;
      }
    }
  }

  .right-wrap {
    position: relative;

    &.is-empty {
      &::before {
        content: attr(data-placeholder);
        display: flex;
        position: absolute;
        align-items: center;
        justify-content: center;
        background-color: #f9f9f9;
        color: #bfbfbf;
        font-size: 16px;
        pointer-events: none;
        inset: 0;
      }
    }

    :deep(.gct-vue3-dnd-container) {
      border-left-width: 0;
    }

    &.is-reversed {
      :deep(.gct-vue3-dnd-container) {
        border-left-width: 2px;
        border-right-width: 0;
      }
    }
  }
</style>
