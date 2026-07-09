<template>
  <div
    class="button-container-wrap box-border relative overflow-visible bottom-button-container-wrap"
    :class="{ 'no-children': !children.length }"
    :data-placeholder="!children.length ? $t('sys.pageDesigner.operateButton') : ''"
  >
    <div v-if="!isNewDesigner" class="bottom-button-container">
      <widget-wrapper
        :actionTypes="['parent', 'delete']"
        class="bottom-btn-warp"
        v-for="(item, index) in children"
        :key="item.id"
        :style="buttonMargin"
        :widget="item"
        :parentWidget="bottomWidget"
        :parentList="children"
        :index-of-parent-list="index"
      >
        <component :is="getAsyncWidget(item)" :widget="item" />
      </widget-wrapper>
    </div>
    <slot
      v-if="isNewDesigner"
      :parentWidget="bottomWidget"
      :children="children"
      :config="{ isDrop: false, isDrag: false }"
    ></slot>
  </div>
</template>
<script name="gct-bottom-button-container" setup lang="ts">
  import { toRefs, toRef, computed } from 'vue';
  import { BottomButtonContainer } from '/@page-designer/types/web';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import { SCOPE } from '/@page-designer/enum';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';

  const { pageJson, getAsyncWidget } = useDesigner();

  const props = defineProps<{
    widget: BottomButtonContainer;
    parentWidget: any;
    isNewDesigner: boolean;
  }>();

  const { margin } = toRefs(props.widget.props);

  const children = toRef(() => {
    props.widget.children.forEach((e) => {
      e = oldBtnToNew(e);
    });
    return props.widget.children || [];
  });
  const buttonMargin = toRef(() => {
    return { marginLeft: margin.value / 2 + 'px', marginRight: margin.value / 2 + 'px' };
  });

  // 旧按钮scheme转为新的
  const oldBtnToNew = (btn) => {
    if (btn.props && Object.prototype.hasOwnProperty.call(btn.props, 'basic')) {
      const basic = { ...btn.props.basic };
      delete btn.props.basic;
      btn.props = {
        ...btn.props,
        title: btn.props.title,
        type: btn.props.type || 'default',
        danger: btn.props.danger || false,
        disabled: btn.props.disabled || false,
        hasIcon: btn.props.hasIcon || true,
        hasText: btn.props.hasText || true,
        hidden: btn.props.hidden,
        icon: btn.props.icon || basic.icon,
        iconColor: '',
        displayRule: btn.props.displayRule,
        displayType: btn.props.displayType,
        parentWidgetId: props.widget.id,
      };
      return btn;
    } else return btn;
  };

  const bottomWidget = computed(() => {
    const widget =
      props.parentWidget?.type === SCOPE.MODAL
        ? props.widget
        : pageJson?.widgets?.find((item) => item.type === 'bottom-button-container');
    return widget;
  });
</script>
<style lang="less" scoped>
  .bottom-button-container-wrap {
    box-shadow: 0 -2px 10px 0 rgb(0 0 0 / 6%);
  }

  .is-selected {
    border: 1px solid var(--ant-primary-color) !important;
  }

  .btn {
    border: 1px solid transparent;
  }

  :deep(.widget-drag) {
    .widget-drag__item:first-child {
      & > div {
        margin-left: 0 !important;
      }
    }

    .widget-drag__item:last-child {
      & > div {
        margin-right: 0 !important;
      }
    }
  }

  :deep(.gct-vue3-dnd-container) {
    display: flex;
    flex-wrap: wrap;
    justify-content: end;
    height: 100%;
    align-items: center;

    > .gct-vue3-dnd-item {
      margin: 0 8px;
    }
  }

  .widget-view-action {
    display: flex;
    position: absolute;
    z-index: 11;
    top: -1px;
    right: 0;
    align-items: center;
    height: 20px;
    background-color: var(--ant-primary-color-deprecated-f-12);
    line-height: 20px;
  }

  .button-container-wrap {
    position: relative;
    min-height: 52px;
    overflow: visible;

    &.no-children {
      background-color: #fbfbfc;
      &::before {
        content: attr(data-placeholder);
        display: flex;
        position: absolute;
        z-index: 1;
        top: 0;
        left: 0;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        // background-color: #fbfbfc;
        color: #c3c3c3;
        pointer-events: none;
      }
    }

    .bottom-button-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: end;
      padding-bottom: 10px;

      .bottom-btn-warp {
        margin-top: 10px;
      }
    }
  }
</style>
