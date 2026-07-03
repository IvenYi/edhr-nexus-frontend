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
      <slot :children="btnChildren"></slot>
    </div>
  </div>
</template>

<script name="gct-button-container" setup lang="ts">
  import { reactive, toRef, computed } from 'vue';
  import { ButtonContainer } from '/@page-designer/types/web';
  import { AGLINE_ENUMS } from '@/enums/designEnum';
  import { SCOPE, ButtonSize, ButtonStyle } from '/@page-designer/enum';

  const props = defineProps<{ widget: ButtonContainer }>();

  const { margin, align, buttonStyle } = reactive(props.widget.props);
  const children = toRef(() => props.widget?.children?.map(transformButton) || []);
  const btnChildren = computed(() => {
    if (align !== AGLINE_ENUMS.BETWEEN) {
      return children.value.map((e) => oldBtnToNew(e)) || [];
    }
    return [];
  });

  const leftChildren = toRef(() => {
    const children = props.widget?.children[0].children?.map((e) => oldBtnToNew(e)) || [];
    return children.map(transformButton);
  });
  const rightChildren = toRef(() => {
    const children = props.widget?.children[1].children?.map((e) => oldBtnToNew(e)) || [];
    return children.map(transformButton);
  });
  const containerMargin = toRef(() => {
    return { marginLeft: -margin / 2 + 'px', marginRight: -margin / 2 + 'px' };
  });

  /**同步属性至按钮组 */
  function transformButton(widget: ButtonContainer['children'][number]) {
    return {
      ...widget,
      // props: { ...widget.props, basic: { ...widget.props.basic, buttonStyle } },
      style: { ...widget.style, marginLeft: margin / 2 + '', marginRight: margin / 2 + '' },
    };
  }

  // 旧按钮scheme转为新的
  const oldBtnToNew = (btn) => {
    if (Object.prototype.hasOwnProperty.call(btn.props, 'basic')) {
      const basic = { ...btn.props.basic };
      delete btn.props.basic;
      btn.props = {
        ...btn.props,
        title: btn.props.title,
        type: btn.props.type || 'default',
        buttonStyle: btn.props.buttonStyle || ButtonStyle.SQUARE,
        danger: btn.props.danger || false,
        disabled: btn.props.disabled || false,
        hasIcon: btn.props.hasIcon || true,
        hasText: btn.props.hasText || true,
        hidden: btn.props.hidden,
        icon: btn.props.icon || basic.icon,
        iconColor: '',
        size: btn.props.size || ButtonSize.DEFAULT,
        displayRule: btn.props.displayRule,
        displayType: btn.props.displayType,
        parentWidgetId: props.widget.id,
      };
      return btn;
    } else return btn;
  };
</script>

<style lang="less" scoped>
  .is-selected {
    border: 1px solid var(--ant-primary-color) !important;
    background-color: rgb(13 170 156 / 10%) !important;
  }
</style>
