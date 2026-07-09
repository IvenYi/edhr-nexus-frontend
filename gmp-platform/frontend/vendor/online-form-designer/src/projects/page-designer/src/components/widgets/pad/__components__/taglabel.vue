<template>
  <tagLayout
    v-if="
      (showTagStyle && tagWidgetStyle?.tagStyleOpen) ||
      type === FIELD_TYPE.ENUM_MULTI ||
      type === FIELD_TYPE.ENUM ||
      multiple
    "
    :disabled="!!disabled"
    :labelLayout="labelLayout"
  >
    <tag
      :class="{ 'whitespace-nowrap': multiple }"
      :showTag="!!(showTagStyle && tagWidgetStyle?.tagStyleOpen)"
      :style="getMsgColor(i)"
      v-for="(i, index) in showLabel"
      :key="index"
      :tagStyle="tagWidgetStyle?.tagStyle"
    >
      <iconNode :labelName="i" />
      {{ truncateString(i, maxTagTextLength) }}
      {{ !tagWidgetStyle?.tagStyleOpen && index < showLabel.length - 1 ? '，' : '' }}
    </tag>
  </tagLayout>
  <tagLayout
    v-else
    :style="getMsgColor(showLabel)"
    :disabled="!!disabled"
    :labelLayout="labelLayout"
    class="leading-none label-ellipsis"
  >
    {{ showLabel }}
  </tagLayout>
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
    label?: string | Array<string | number>;
    isDesign?: boolean;
    /** 外部控制是否显示标签样式 */
    showTagStyle?: boolean;
    multiple?: boolean;
    iconExtraProps?: {
      [k: string]: {
        icon: string;
        iconColor: string;
        textColor: string;
      };
    };
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
  defineEmits(['on-close']);

  // const { t } = useI18n();

  const labelLayout = inject('labelLayout', {});

  const showLabel = toRef(() => {
    let showMsg = props.label ?? '';
    // 设计模式，如果没有传入label，则去拉取样例文本
    if ((!showMsg || showMsg.length <= 0) && props.isDesign) {
      // 获取样例文本
      showMsg = props.type ? transformField2Component(props.type).example : '';
      // 样例文本转为国际化文本
      // showMsg = example;
    }
    if (
      (props.showTagStyle && props.tagWidgetStyle?.tagStyleOpen) ||
      props.type === FIELD_TYPE.ENUM_MULTI ||
      props.type === FIELD_TYPE.ENUM ||
      props.multiple
    ) {
      return showMsg ? (isString(showMsg) ? [showMsg] : showMsg) : [];
    } else if (showMsg instanceof Array) {
      return showMsg.join('，');
    } else {
      return showMsg;
    }
  });
  const comStyle = toRef(() => {
    const contentFont = props.tagWidgetStyle?.contentFont;
    if (!contentFont) return {};
    return schemaToStyle(contentFont);
  });

  const getMsgColor = (key) => {
    const iconAttrs: any = props.iconExtraProps?.[key] || {};
    const color = {};

    Object.assign(color, {
      color: iconAttrs?.textColor || '#000000',
    });
    if (comStyle.value?.color) {
      return comStyle.value;
    }
    return {
      wordBreak: 'break-all',
      ...comStyle.value,
      ...color,
    };
  };

  const iconNode = {
    render: ({ $attrs }) => {
      if ($attrs.labelName) {
        const iconAttrs: any = props.iconExtraProps?.[$attrs.labelName] || {};
        if (!iconAttrs?.icon) return;
        return h(IconNext, {
          size: 16,
          value: iconAttrs?.icon,
          color: iconAttrs?.iconColor,
          style: 'vertical-align: text-bottom; margin-right: 4px',
        });
      }
    },
  };
</script>
<style scoped lang="less">
  .tag-label-disabled {
    // opacity: 0.5;
    color: var(--van-field-input-disabled-text-color) !important;
  }

  .label-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .label-wrap {
    word-break: break-all;
    white-space: wrap;
  }
  .leading-none {
    line-height: 1.1;
  }
</style>
