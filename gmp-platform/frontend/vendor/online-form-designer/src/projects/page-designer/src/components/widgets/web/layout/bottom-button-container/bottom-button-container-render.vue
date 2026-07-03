<template>
  <div
    v-if="children.length"
    :style="containerStyle"
    class="box-border relative overflow-hidden bottom-button-container-wrap"
  >
    <div
      class="bottom-button-content"
      :style="{
        ...containerMargin,
      }"
    >
      <slot :children="children"></slot>
    </div>
  </div>
</template>
<script name="gct-bottom-button-container" setup lang="ts">
  import { computed, toRef } from 'vue';
  import { BottomButtonContainer } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { isEmpty } from 'lodash-es';
  import { flowRight } from 'lodash-es';
  const Event = getPageEvent();
  const props = defineProps<{ widget: BottomButtonContainer }>();
  const children = toRef(() => filterButtonByList(props.widget?.children || []));
  const { processId, filterButton } = Event.ProcessAppRoved! || {};
  const { processId: formProcessId } = props.widget.props;
  const containerStyle = computed(() => {
    const style = props.widget.style;
    return {
      backgroundColor: '#fff !important',
      height: style.height ? style.height + 'px' : 'auto',
      borderLeft: `${style.borderLeft?.borderWidth}px ${style.borderLeft?.borderStyle} ${style.borderLeft?.borderColor} !important`,
      borderRight: `${style.borderRight?.borderWidth}px ${style.borderRight?.borderStyle} ${style.borderRight?.borderColor} !important`,
      borderBottom: `${style.borderBottom?.borderWidth}px ${style.borderBottom?.borderStyle} ${style.borderBottom?.borderColor} !important`,
      borderTop: `${style.borderTop?.borderWidth}px ${style.borderTop?.borderStyle} ${style.borderTop?.borderColor} !important`,
      borderTopRightRadius: !style.borderTopRightRadius
        ? ''
        : style.borderTopRightRadius + 'px !important',
      borderTopLeftRadius: !style.borderTopLeftRadius
        ? ''
        : style.borderTopLeftRadius + 'px !important',
      borderBottomRightRadius: !style.borderBottomRightRadius
        ? ''
        : style.borderBottomRightRadius + 'px !important',
      borderBottomLeftRadius: !style.borderBottomLeftRadius
        ? ''
        : style.borderBottomLeftRadius + 'px !important',
      marginTop: isEmpty(style.marginTop) ? '' : style.marginTop + 'px !important',
      marginRight: isEmpty(style.marginRight) ? '' : style.marginRight + 'px !important',
      marginBottom: isEmpty(style.marginBottom) ? '' : style.marginBottom + 'px !important',
      marginLeft: isEmpty(style.marginLeft) ? '' : style.marginLeft + 'px !important',
    };
  });

  const computedMargin = computed(() => {
    return props?.widget?.props?.margin || 16;
  });

  const containerMargin = toRef(() => {
    return {
      marginLeft: -computedMargin.value / 2 + 'px',
      marginRight: -computedMargin.value / 2 + 'px',
    };
  });

  function transformButton(widget: any) {
    const margin = props?.widget?.props?.margin || 16;
    return {
      ...widget,
      style: {
        ...widget.style,
        marginLeft: margin / 2 + '',
        marginRight: margin / 2 + '',
      },
    };
  }
  /**过滤按钮 */
  function filterButtonByList(list: any[]) {
    const flowList = [(i) => i.map(transformButton)];
    if (formProcessId === processId && filterButton) {
      flowList.push(filterButton.bind(Event.ProcessAppRoved));
    }
    return flowRight(flowList)(list);
  }

  /**执行内置事件 */
  function runInnerEvent(prop) {
    /**兼容老版本按钮数据结构,新版本上不需要加 */
    if (prop.eventName && !Object.keys(prop.events).length) {
      prop.events = {
        onClick: {
          name: prop.eventName,
        },
      };
    }
    Event.runEventByName('onClick', prop.events);
  }

  const handleClick = (widget) => {
    if (!widget.props.innerEvent) {
      runInnerEvent(widget.props);
    }
  };
</script>
<style lang="less" scoped>
  .bottom-button-container-wrap {
    display: flex;
    align-items: center;
    justify-content: end;
    min-height: 60px;
    padding: 0 16px 6px;
    box-shadow: 0 -2px 10px 0 rgb(0 0 0 / 6%);

    .bottom-button-content {
      display: flex;
      flex-wrap: wrap;
      justify-content: end;

      :deep(.inline-block.align-middle) {
        margin-top: 10px;
      }
    }

    > div {
      flex: 1;
    }

    .btn-more {
      display: flex;
      flex-flow: column;
      align-items: center;
      justify-content: center;
      height: 100%;

      &-title {
        color: #212528;
        font-size: 14px;
        line-height: 1;
      }
    }

    :deep(.van-button) {
      width: 100%;
    }
  }

  .is-selected {
    border: 1px solid var(--ant-primary-color) !important;
  }

  .widget-view-action {
    display: flex;
    position: absolute;
    z-index: 11;
    top: -1px;
    right: 0;
    // bottom: 0;
    align-items: center;
    height: 20px;
    // padding: 0 4px;
    background-color: var(--ant-primary-color-deprecated-f-12);
    line-height: 20px;

    .opt-icon {
      margin: 4px;
      color: var(--ant-primary-color);
      font-size: 14px;
      cursor: pointer;
    }
  }
</style>
