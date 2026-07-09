<template>
  <span class="tag cursor-pointer" :class="getTagClass" v-if="showTag"> <slot></slot> </span>
  <span v-else><slot></slot> </span>
</template>

<script setup lang="ts">
  import { ref, onMounted, toRef, computed } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { TagTypeEnum } from '/@page-designer/enum';

  const props = withDefaults(
    defineProps<{
      tagStyle?: LowCodeWidget.TagConfigStyle;
      showTag?: boolean;
    }>(),
    { showTag: true },
  );
  const tagType = toRef(() => {
    return props.tagStyle?.tagType || TagTypeEnum.RADIUS;
  });
  const tagStyleColor = toRef(() => {
    return props.tagStyle?.color || '#f0f0f0';
  });
  const getTagClass = toRef(() => {
    return `tag-${tagType.value}`;
  });
</script>
<style scoped lang="less">
  .tag {
    max-width: 100%;
    margin-right: 5px;
    padding: 4px 6px;
    line-height: 1;

    &-radius {
      border-radius: 4px;
      background: v-bind('tagStyleColor');
    }

    &-linear_radius {
      border: 1px solid v-bind('tagStyleColor');
      border-radius: 4px;
    }

    &-big_radius {
      border-radius: 100px;
      background: v-bind('tagStyleColor');
    }

    &-linear_big_radius {
      border: 1px solid v-bind('tagStyleColor');
      border-radius: 100px;
    }

    &-dashed_radius {
      border: 1px dashed v-bind('tagStyleColor');
      border-radius: 4px;
    }

    &-status {
      border-radius: 14px 4px 4px;
      background: v-bind('tagStyleColor');
    }
  }
</style>
