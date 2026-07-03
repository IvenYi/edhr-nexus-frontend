<template>
  <a-timeline :class="[ns.b()]">
    <a-timeline-item
      v-for="item in props.items"
      :key="item.id"
      :style="getStyleVars(item)"
      :class="[ns.e('item'), ns.b('item'), ns.is('selected', item.id === selectedId)]"
      @click="onClick(item)"
    >
      <template #dot>
        <i :class="[ns.be('item', 'icon')]"></i>
      </template>
      <slot name="default" v-bind="{ item }"></slot>
    </a-timeline-item>
  </a-timeline>
</template>

<script lang="ts" setup name="timeline">
  import { useNamespace } from '@gct/runtime';
  import { ITimelineItem } from './type';

  const ns = useNamespace('timeline');

  const getStyleVars = (item: ITimelineItem) => {
    return ns.cssVarBlock({
      'dot-color': item.color || 'var(--ant-primary-color)',
    });
  };

  const props = withDefaults(
    defineProps<{
      items?: Array<ITimelineItem>;
      selectedId?: string;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:selectedId', value: string): void;
  }>();

  const onClick = (item) => {
    emit('update:selectedId', item.id);
  };
</script>

<style lang="scss" scoped>
  $timeline: ();

  @include b(timeline) {
    @include set-component-css-var(timeline, $timeline);
    padding: 8px 12px 0 11px;

    :deep(.ant-timeline-item) {
      padding-bottom: 16px;
    }

    :deep(.ant-timeline-item-content) {
      background: rgba(0, 0, 0, 0.02);
      border-radius: 4px 4px 4px 4px;
      border: 1px solid #e8ebf0;
      top: 0;
      margin-left: 20px;
    }
    :deep(.ant-timeline-item-tail) {
      border-left: 1px dashed #b7bcc6;
      top: 0;
      height: 100%;
    }
    :deep(.ant-timeline-item-head) {
      top: 4px;
      padding: 0;
    }
    :deep(.ant-timeline-item.ant-timeline-item-last) {
      > .ant-timeline-item-content {
        min-height: 0;
      }
      > .ant-timeline-item-tail {
        display: block;
      }
      padding-bottom: 0;
      margin-bottom: 20px;
    }

    :deep(.ant-timeline-item-head-custom) {
      left: 1px;
      transform: none;
    }
  }

  @include b(timeline-item) {
    @include e(icon) {
      background-clip: content-box;
      // border: 2px solid transparent;
      border: 0;
      border-radius: 100px;
      height: 7px;
      width: 7px;
      display: block;
      background-color: getCssVar(timeline, dot-color);
      border-color: unquote('rgba(from getCssVar(timeline, dot-color) r g b / 9.65%)');
    }

    @include when(selected) {
      :deep(.ant-timeline-item-content) {
        background-color: #ffffff;
        border-color: #ffffff;
      }
    }
  }
</style>
