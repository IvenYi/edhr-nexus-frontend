<template>
  <span class="tag label-ellipsis" :class="getTagClass">
    <span class="select-text" :style="msgColor"> {{ showLabel || '&nbsp;' }}</span>
  </span>
</template>

<script setup lang="ts">
  import { toRef, reactive } from 'vue';
  import { TagTypeEnum } from '/@page-designer/enum';

  const props = defineProps<{
    data: {
      key: string;
      value: string;
      label: string;
      labelStyle: string;
      labelColor: string;
      valueColor: string;
    };
  }>();

  const showLabel = toRef(() => {
    return props.data.label + '';
  });

  const tagType = toRef(() => {
    return props.data.labelStyle || TagTypeEnum.RADIUS;
  });
  const tagStyleColor = toRef(() => {
    return props.data.labelColor || '#026ac8';
  });

  const getTagClass = toRef(() => {
    return `tag-${tagType.value}`;
  });

  const msgColor = toRef(() => {
    return {
      color: props.data.valueColor || '#fff',
    };
  });
</script>

<style scoped lang="less">
  .label-ellipsis {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }
  .tag {
    padding: 4px 6px;
    line-height: 1;

    & + & {
      margin-left: 5px;
    }

    &-radius {
      border-radius: 2px;
      background: v-bind('tagStyleColor');
    }

    &-linear_radius {
      border: 1px solid v-bind('tagStyleColor');
      border-radius: 2px;
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
      border-radius: 2px;
    }

    &-status {
      border-radius: 10px 2px 2px;
      background: v-bind('tagStyleColor');
    }
  }
</style>
