<template>
  <div class="relative box-border overflow-hidden">
    <div v-if="align === AGLINE_ENUMS.BETWEEN" class="ks-row-between">
      <div :style="containerMargin">
        <slot :children="leftChildren"></slot>
      </div>
      <div :style="containerMargin">
        <slot :children="rightChildren"></slot>
      </div>
    </div>
    <div
      v-else
      :style="{
        'text-align': align,
        ...containerMargin,
      }"
    >
      <slot :children="children"></slot>
    </div>
  </div>
</template>

<script name="gct-button-container" setup lang="ts">
  import { reactive, toRef, computed } from 'vue';
  import { ButtonContainer } from '/@page-designer/types/mobile';
  import { AGLINE_ENUMS } from '@/enums/designEnum';

  const props = defineProps<{ widget: ButtonContainer }>();

  const { margin, align, buttonStyle } = reactive(props.widget.props);
  const children = toRef(() => props.widget?.children?.map(transformButton) || []);
  const leftChildren = toRef(() => {
    const children = props.widget?.children[0].children || [];
    return children.map(transformButton);
  });
  const rightChildren = toRef(() => {
    const children = props.widget?.children[1].children || [];
    return children.map(transformButton);
  });
  const containerMargin = toRef(() => {
    return { marginLeft: -margin / 2 + 'px', marginRight: -margin / 2 + 'px' };
  });

  /**同步属性至按钮组 */
  function transformButton(widget: ButtonContainer['children'][number]) {
    widget.props.basic = { buttonStyle };
    return {
      ...widget,
      style: { ...widget.style, marginLeft: margin / 2 + '', marginRight: margin / 2 + '' },
    };
  }
</script>

<style lang="less" scoped>
  .is-selected {
    border: 1px solid var(--ant-primary-color) !important;
    background-color: rgb(13 170 156 / 10%) !important;
  }
</style>
