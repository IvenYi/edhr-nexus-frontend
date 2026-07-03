<template>
  <div class="inline-block align-middle">
    <div class="ks-row-middle">
      <BaseButtonComponent
        :widget="widget"
        class="import-base-btn"
        v-bind="widget.props"
        @click="onclick"
      />
      <a-tooltip placement="bottom" title="下载模板">
        <BaseButtonComponent
          :widget="widget"
          class="import-download"
          v-bind="iconProps"
          :style="iconStylleVars"
          @click="download"
        />
      </a-tooltip>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, PropType } from 'vue';
  import { IconNext } from '/@/components/Icon';
  import { ButtonStyle, ButtonSize } from '/@page-designer/enum';
  import { Modal } from 'ant-design-vue';
  import { debounce } from 'lodash-es';
  import { BaseButton } from '/@page-designer/types/web';
  import BaseButtonComponent from './base_button.vue';

  const props = defineProps({
    widget: {
      type: Object as PropType<BaseButton>,
    },
  });
  const emit = defineEmits(['click']);

  const iconProps = computed(() => {
    return {
      ...props.widget.props,
      hasText: false,
      hasIcon: true,
      icon: 'icon-daoru',
      title: '',
    };
  });

  const lineBgColor = computed(() => {
    const { type, enableCustomColor, backgroundColor, fontColor } = props.widget.props;
    if (type === 'link') return !enableCustomColor ? themeVars.primaryColor : fontColor;
    else if (type === 'primary' || (enableCustomColor && !whiteColor.includes(backgroundColor!)))
      return '#fff';
    else if (enableCustomColor && whiteColor.includes(backgroundColor!)) return fontColor;
    else return '#E8EBF0';
  });
  const iconStylleVars = computed(() => {
    return {
      '--line-height':
        props.widget.props.type === 'link' ||
        (props.widget.props.enableCustomColor &&
          props.widget.whiteColor.includes(props.widget.props.backgroundColor!))
          ? '16px'
          : '100%',
      '--download-border-color': lineBgColor.value,
    };
  });
</script>
<style scoped lang="less"></style>
