<template>
  <basic-button
    v-if="Object.prototype.hasOwnProperty.call(widget.props, 'basic')"
    v-bind="basic"
    dropdown
  >
    {{ title }}
    <template #icon> <vertical-align-bottom-outlined /> </template>
  </basic-button>
  <!-- 新版本的BaseButton -->
  <div class="ks-row-middle">
    <baseButton
      :widget="widget"
      class="import-base-btn"
      v-if="!Object.prototype.hasOwnProperty.call(widget.props, 'basic')"
      v-bind="widget.props"
    />
    <baseButton
      :widget="widget"
      class="import-download"
      v-if="!Object.prototype.hasOwnProperty.call(widget.props, 'basic')"
      v-bind="{
        ...widget.props,
        hasText: false,
        hasIcon: true,
        icon: 'icon-daoru',
      }"
      :style="{
        '--line-height':
          widget.props.type === 'link' ||
          (widget.props.enableCustomColor && whiteColor.includes(widget.props.backgroundColor!))
            ? '16px'
            : '100%',
        '--download-border-color': lineBgColor,
      }"
    />
  </div>
</template>

<script setup lang="ts" name="gct-import-button">
  import basicButton from '../../__components__/basic_button.vue';
  import { toRefs, computed } from 'vue';
  import { ExportButton } from '/@page-designer/types/web';
  import baseButton from '../../__components__/base_button.vue';
  // import { ButtonStyle } from '/@page-designer/enum';
  import { useTheme } from '/@/hooks/web/useTheme';

  const { themeVars } = useTheme();

  const props = defineProps<{ widget: ExportButton }>();
  const { title, basic, size } = toRefs(props.widget.props);

  const whiteColor = ['#FFFFFF', '#ffffff', '#fff', '#FFF'];
  const lineBgColor = computed(() => {
    const { type, enableCustomColor, backgroundColor, fontColor } = props.widget.props;
    if (type === 'link') return !enableCustomColor ? themeVars.primaryColor : fontColor;
    else if (type === 'primary' || (enableCustomColor && !whiteColor.includes(backgroundColor!)))
      return '#fff';
    else if (enableCustomColor && whiteColor.includes(backgroundColor!)) return fontColor;
    else return '#E8EBF0';
  });
</script>
<style scoped lang="less">
  .square {
    height: 72px !important;

    &.ant-btn-sm {
      height: 64px !important;
    }

    &.ant-btn-lg {
      height: 88px !important;
    }
  }

  .alignmiddle {
    vertical-align: middle;
  }

  .import-base-btn {
    :deep(.ant-btn) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right-color: transparent;
    }
  }

  .import-download {
    position: relative;

    :deep(.ant-btn) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-left-color: transparent;
      // border-left-color: var(--download-border-color);
    }

    &::before {
      content: '';
      display: block;
      position: absolute;
      z-index: 1;
      top: 50%;
      left: 0;
      width: 1px;
      height: var(--line-height);
      transform: translateY(-50%);
      background-color: var(--download-border-color);
    }
  }
</style>
