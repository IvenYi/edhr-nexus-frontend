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

<script name="gct-button-process-container" setup lang="ts">
  import { reactive, toRef, computed, onMounted } from 'vue';
  import { ButtonProcessContainer, approveButton } from '/@page-designer/types/web';
  import { AGLINE_ENUMS } from '@/enums/designEnum';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { flowRight } from 'lodash-es';

  const props = defineProps<{ widget: ButtonProcessContainer }>();
  const Event = getPageEvent();
  const { processId, filterButton } = Event.ProcessAppRoved! || {};
  const { margin, align, processId: formProcessId } = reactive(props.widget.props);
  const children = toRef(() => {
    const children = props.widget?.children || [];
    return filterButtonByList(children);
  });
  const leftChildren = toRef(() => {
    const children = props.widget?.children[0].children || [];
    return filterButtonByList(children);
  });
  const rightChildren = toRef(() => {
    const children = props.widget?.children[1].children || [];
    return filterButtonByList(children);
  });
  const containerMargin = toRef(() => {
    return { marginLeft: -margin / 2 + 'px', marginRight: -margin / 2 + 'px' };
  });

  /**过滤按钮 */
  function filterButtonByList(list: approveButton[]) {
    const flowList = [(i) => i.map(transformButton)];
    if (formProcessId === processId && filterButton) {
      flowList.push(filterButton.bind(Event.ProcessAppRoved));
    }
    return flowRight(flowList)(list);
  }

  /**同步属性至按钮组 */
  function transformButton(widget: approveButton) {
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
