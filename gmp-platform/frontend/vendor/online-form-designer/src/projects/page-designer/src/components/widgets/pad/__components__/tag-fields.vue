<template>
  <div class="max-w-100% overflow-hidden">
    <tag
      :class="{ ell: multiple, 'tag-flex': true }"
      :showTag="!!(showTagStyle && tagWidgetStyle?.tagStyleOpen)"
      :style="getMsgColor(i)"
      v-for="(i, index) in valueOptions"
      :key="index"
      :tagStyle="tagWidgetStyle?.tagStyle"
    >
      <div class="tag-prefix">
        <slot name="prefix" :option="i"></slot>
      </div>
      <div class="tag-label">
        <slot name="label" :option="i" :label="i.label">
          {{ truncateString(i.label, maxTagTextLength) }}
        </slot>
      </div>
      <div
        v-if="!tagWidgetStyle?.tagStyleOpen && index < valueOptions.length - 1"
        class="tag-separator"
      >
        ，
      </div>
    </tag>
  </div>
</template>

<script setup lang="ts">
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';
  import { h, inject, toRef } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { isString } from '/@/utils/is';
  import { schemaToStyle } from '/@page-designer/hooks/useStyle';
  import tag from './tag.vue';
  import IconNext from '@mobile/components/icon/index.vue';
  import tagLayout from './tag-layout.vue';

  export interface Props {
    /**最大显示个数 */
    maxTagTextLength?: number;
    tagWidgetStyle?: {
      tagStyleOpen: boolean;
      contentFont: LowCodeWidget.FontStyle;
      tagStyle?: LowCodeWidget.TagConfigStyle;
    };
    type?: FIELD_TYPE | undefined;
    disabled?: boolean;
    valueOptions: Array<any> | object;
    /** 外部控制是否显示标签样式 */
    showTagStyle?: boolean;
    multiple?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    showTagStyle: true,
  });
  function truncateString(str, maxTagTextLength) {
    // 如果字符串长度不超过最大长度，直接返回
    if (!maxTagTextLength || str.length <= maxTagTextLength || !props.multiple) {
      return str;
    }

    // 截取字符串并添加省略号
    return str.substring(0, maxTagTextLength) + '...';
  }
  const comStyle = toRef(() => {
    const contentFont = props.tagWidgetStyle?.contentFont;
    if (!contentFont) return {};
    return schemaToStyle(contentFont);
  });
  const getMsgColor = (key) => {
    if (comStyle.value?.color) {
      return comStyle.value;
    }
    return {
      wordBreak: 'break-all',
      ...comStyle.value,
    };
  };
</script>
<style scoped lang="less">
  .tag-flex {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    min-width: 0;
  }

  .tag-prefix {
    flex-shrink: 0;
  }

  .tag-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tag-separator {
    flex-shrink: 0;
  }
</style>
