<template>
  <div
    v-if="showTagStyle && tagWidgetStyle?.tagStyleOpen"
    :class="[
      disabled ? 'tag-label-disabled' : null,
      !!labelLayout?.hasLabelWidth && labelLayout?.layout.label === 'left'
        ? labelLayout?.overLabelDisplay == 'ellipsis'
          ? 'label-ellipsis'
          : 'label-wrap'
        : '',
    ]"
  >
    <tag
      v-for="(i, index) in showLabel"
      :key="index"
      :tagStyle="tagWidgetStyle.tagStyle"
      :style="getMsgColor(i)"
    >
      <iconNode :labelName="i" />
      <span>{{ i }}</span>
    </tag>
  </div>
  <div
    v-else-if="type === FIELD_TYPE.ENUM_MULTI || type === FIELD_TYPE.ENUM"
    :class="[
      disabled ? 'tag-label-disabled' : null,
      'tag-text',
      !!labelLayout?.hasLabelWidth && labelLayout?.layout.label === 'left'
        ? labelLayout?.overLabelDisplay == 'ellipsis'
          ? 'label-ellipsis'
          : 'label-wrap'
        : '',
    ]"
  >
    <span :style="getMsgColor(i)" v-for="(i, index) in showLabel" :key="index" class="mr-5px">
      <iconNode :labelName="i" />
      <span>
        {{ i }}{{ !tagWidgetStyle?.tagStyleOpen && index < showLabel.length - 1 ? ',' : '' }}
      </span>
    </span>
  </div>
  <div
    v-else-if="
      [FIELD_TYPE.ORG_MULTI, FIELD_TYPE.ORG, FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI].includes(type)
    "
    :class="[
      disabled ? 'tag-label-disabled' : null,
      'tag-text',
      !!labelLayout?.hasLabelWidth && labelLayout?.layout.label === 'left'
        ? labelLayout?.overLabelDisplay == 'ellipsis'
          ? 'label-ellipsis'
          : 'label-wrap'
        : '',
    ]"
  >
    <span :style="getMsgColor(i)" v-for="(i, index) in showLabel" :key="index" class="mr-5px">
      <span
        v-if="type === FIELD_TYPE.ORG_MULTI || type === FIELD_TYPE.ORG"
        class="gct-iconfont icon-ziduan-bumen primary-gct"
      ></span>
      <img v-else class="user-avatar mr4px" :src="getAvatar(i)" />
      <span>
        {{ i }}{{ !tagWidgetStyle?.tagStyleOpen && index < showLabel.length - 1 ? ',' : '' }}
      </span>
    </span>
  </div>
  <div
    v-else
    :style="getMsgColor(showLabel)"
    :class="[
      disabled ? 'tag-label-disabled' : null,
      'text-[#000000]',
      !!labelLayout?.hasLabelWidth && labelLayout?.layout.label === 'left'
        ? labelLayout?.overLabelDisplay == 'ellipsis'
          ? 'label-ellipsis'
          : 'label-wrap'
        : '',
    ]"
  >
    {{ showLabel }}
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
  // import { useI18n } from '@mobile/utils/useI18n';
  import IconNext from '@mobile/components/icon/index.vue';
  import defaultAvatar from '@mobile/assets/ipad/default_avatar.png';

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
    /** 外部控制是否显示标签样式 */
    showTagStyle?: boolean;
    iconExtraProps?: {
      [k: string]: {
        icon: string;
        iconColor: string;
        textColor: string;
      };
    };
    avatarProps?: {
      [k: string]: {
        avatar: string;
      };
    };
  }

  const props = withDefaults(defineProps<Props>(), {
    showTagStyle: true,
  });

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
      props.type === FIELD_TYPE.ENUM
    ) {
      return showMsg ? (isString(showMsg) ? [showMsg] : showMsg) : [];
    } else if (
      [FIELD_TYPE.ORG_MULTI, FIELD_TYPE.ORG, FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI].includes(
        props.type,
      )
    ) {
      return showMsg ? (isString(showMsg) ? [showMsg] : showMsg) : [];
    } else {
      return showMsg + '';
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

  const getAvatar = (key) => {
    const avatarAttrs: any = props.avatarProps?.[key] || {};
    const avatar = avatarAttrs?.avatar ? `/minio/${avatarAttrs.avatar}` : defaultAvatar;
    return avatar;
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

  .user-avatar {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    vertical-align: middle;
  }
</style>
