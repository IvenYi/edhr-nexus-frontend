<template>
  <div class="virtual-scroll" v-bind="containerProps" :style="containerStyle">
    <div v-bind="wrapperProps">
      <template v-for="item in list">
        <slot name="item" v-bind="item"></slot>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup name="virtual-scroll">
  import { useVirtualList } from '@vueuse/core';
  import { CSSProperties, reactive, toRef, watch } from 'vue';

  interface Options {
    /** 方向横向(horizontal) 纵向(vertical) */
    direction: 'vertical' | 'horizontal';
    /** 每个的尺寸,纵向是高,横向是宽 */
    itemSize: number;
    /** 总容器固定尺寸 纵向是高,横向是宽 */
    containerSize?: number;
    /** 总容器最大尺寸 纵向是高,横向是宽, 数量小于最大尺寸的时候高度为数量x每个的尺寸 */
    containerMaxSize?: number;
    /** 预加载的个数,即超过显示区域后面多加载的个数,防止滚动时出现空白 */
    preRenderNum?: number;
  }

  const props = withDefaults(
    defineProps<{
      items?: any[];
      options: Options;
    }>(),
    {
      items: () => [],
    },
  );

  const containerStyle = reactive<CSSProperties>({});

  const _options: any = {
    [props.options.direction === 'vertical' ? 'itemHeight' : 'itemWidth']: props.options.itemSize,
  };

  const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(
    toRef(props, 'items'),
    _options,
  );

  defineExpose({
    scrollTo,
  });

  /** 计算容器的尺寸样式 */
  function calcContainerSize() {
    const { direction, itemSize, containerSize, containerMaxSize } = props.options;
    const StyleKey = direction === 'vertical' ? 'height' : 'width';
    if (containerSize) {
      containerStyle[StyleKey] = containerSize + 'px';
    } else if (containerMaxSize) {
      // containerStyle[StyleKey] =
      //   Math.min(containerMaxSize, itemSize * (props.items.length ?? 0)) + 'px';
      containerStyle[StyleKey] =
        containerMaxSize < itemSize * (props.items.length ?? 0) ? containerMaxSize + 'px' : 'auto';
    } else {
      // 没有设置固定尺寸也没设置容器最大尺寸，则默认设置容器尺寸为 300px
      containerStyle[StyleKey] = 300 + 'px';
    }
  }

  watch(
    () => props.options,
    () => {
      calcContainerSize();
    },
    {
      deep: true,
      immediate: true,
    },
  );
</script>

<style lang="less" scoped></style>
