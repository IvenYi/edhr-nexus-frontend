<template>
  <tagLayout
    v-if="showTagStyle && tagWidgetStyle?.tagStyleOpen"
    :disabled="!!disabled"
    :labelLayout="labelLayout"
  >
    <tag
      v-for="(i, index) in showLabel"
      :key="index"
      :tagStyle="tagWidgetStyle.tagStyle"
      :style="getMsgColor(i)"
    >
      <Avatar
        v-if="props.avatar"
        :src="transformUrl(props.avatar)"
        :size="20"
        style="margin-top: -5px"
        class="mr4px"
      />
      <iconNode :labelName="i" />
      <span class="select-text">{{ i }}</span>
      <IconNext
        v-if="closable"
        :size="15"
        :value="'icon-park:close-small'"
        :style="{
          verticalAlign: 'text-bottom',
          '--color': 'rgba(0,0,0,.45)',
          lineHeight: '1',
          marginLeft: '2px',
        }"
        @click.prevent.stop="$emit('on-close')"
      />
    </tag>
  </tagLayout>
  <tagLayout
    :disabled="!!disabled"
    :labelLayout="labelLayout"
    v-else-if="type === FIELD_TYPE.ENUM_MULTI || type === FIELD_TYPE.ENUM"
  >
    <span :style="getMsgColor(i)" v-for="(i, index) in showLabel" :key="index" class="mr-5px">
      <iconNode :labelName="i" />
      <span class="select-text">
        {{ i }}{{ !tagWidgetStyle?.tagStyleOpen && index < showLabel.length - 1 ? '，' : '' }}
      </span>
    </span>
    <span v-if="!showLabel.length">&nbsp;</span>
  </tagLayout>

  <tagLayout
    :style="getMsgColor(showLabel)"
    :disabled="!!disabled"
    :labelLayout="labelLayout"
    v-else
    :title="props.title"
    class="select-text leading-none"
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
  import tagLayout from './tag-layout.vue';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import { Avatar } from 'ant-design-vue';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';

  export interface Props {
    tagWidgetStyle?: {
      tagStyleOpen: boolean;
      contentFont: LowCodeWidget.FontStyle;
      tagStyle?: LowCodeWidget.TagConfigStyle;
    };
    type?: FIELD_TYPE | undefined;
    disabled?: boolean;
    label?: string | Array<string | number>;
    isDesign?: boolean;
    closable?: boolean;
    /** 外部控制是否显示标签样式 */
    showTagStyle?: boolean;
    /** 头像 */
    avatar?: string;
    title?: string;
    iconExtraProps?: {
      [k: string]: {
        icon: string;
        iconColor: string;
        textColor: string;
      };
    };
    iconProps?: {
      icon: string;
      iconColor: string;
      textColor: string;
    };
  }

  const props = withDefaults(defineProps<Props>(), {
    showTagStyle: true,
  });
  const { themeSetting } = useThemeSetting();

  defineEmits(['on-close']);
  const labelLayout = inject('labelLayout', {});

  const showLabel = toRef(() => {
    let showMsg = props.label ?? '';
    // 设计模式，如果没有传入label，则去拉取样例文本
    if ((!showMsg || showMsg.length <= 0) && props.isDesign) {
      // 获取样例文本
      const example = props.type ? transformField2Component(props.type)?.example || '' : '';
      // 样例文本转为国际化文本
      showMsg = example ? (isString(example) ? $t(example) : example.map((e) => $t(e))) : '';
    }
    if (
      (props.showTagStyle && props.tagWidgetStyle?.tagStyleOpen) ||
      props.type === FIELD_TYPE.ENUM_MULTI ||
      props.type === FIELD_TYPE.ENUM
    ) {
      return showMsg ? (isString(showMsg) ? showMsg.split(',') : showMsg) : [];
    } else if (showMsg instanceof Array) {
      return showMsg.join('，');
    } else {
      return showMsg + '';
    }
  });
  const comStyle = toRef(() => {
    const contentFont = props.tagWidgetStyle?.contentFont;
    if (!contentFont) return {};
    return schemaToStyle(contentFont);
  });

  const getMsgColor = (key: string = '') => {
    const iconAttrs: any = props.iconExtraProps?.[key] || {};
    const color = {};

    if (iconAttrs?.textColor) {
      Object.assign(color, {
        color: iconAttrs?.textColor,
      });
    }
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
        const iconAttrs: any = props.iconExtraProps?.[$attrs.labelName] || props.iconProps || {};
        if (!iconAttrs?.icon) return;
        return h(IconNext, {
          size: 16,
          value: iconAttrs?.icon,
          color: iconAttrs?.iconColor || themeSetting.themeColor,
          style: 'vertical-align: text-bottom; margin-right: 3px',
        });
      }
    },
  };
</script>
<style scoped lang="less">
  .tag-label-disabled {
    opacity: 0.5;
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

  .select-text {
    // line-height: 20px;
    min-width: 16px;
  }
  .leading-none {
    line-height: 1.375;
  }
</style>
