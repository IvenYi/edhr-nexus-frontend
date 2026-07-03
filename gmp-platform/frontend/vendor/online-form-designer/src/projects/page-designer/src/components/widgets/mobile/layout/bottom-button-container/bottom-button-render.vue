<template>
  <WidgetAsync class="bottom-btn" :widget="props.widget" />
</template>

<script name="gct-bottom-container" setup lang="ts">
  import { BaseButton } from '/@page-designer/types/mobile';
  import WidgetAsync from '/@web-render/render/widget/widget-mobile-async.vue';
  import { operateSysEnums, FormComponents } from '/@page-designer/enum';
  const props = defineProps<{ widget: BaseButton }>();
  if (props.widget.type === FormComponents.BaseButton) {
    transfromoldwidget();
  }

  /**老数据兼容 */
  function transfromoldwidget() {
    const { innerEvent, sysMethedType, eventName } = props.widget.props;
    if (innerEvent && sysMethedType) {
      const btnMap = {
        [operateSysEnums.SUBMIT]: FormComponents.SubmitButton,
        [operateSysEnums.RESET]: FormComponents.ResetButton,
      };
      props.widget.type = btnMap[sysMethedType];
    } else {
      props.widget.type = FormComponents.CustomButton;
      props.widget.events = {
        onclick: {
          name: eventName,
          type: 'js',
        },
      };
    }
  }
</script>
<style lang="less" scoped>
  .bottom-btn {
    display: block;

    :deep(.van-button) {
      height: var(--van-button-default-height);
      padding: 0 8px;
      font-size: 12px;
    }
  }
</style>
