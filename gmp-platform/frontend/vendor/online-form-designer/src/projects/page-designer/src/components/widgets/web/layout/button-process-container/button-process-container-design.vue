<template>
  <div ref="btnContainerRef" class="button-container-design relative box-border overflow-visible">
    <div
      v-if="align === AGLINE_ENUMS.BETWEEN"
      class="ks-row-between button-container-wrap"
      :class="{
        'no-children': !children[0].children?.length,
      }"
      :data-placeholder="
        !children[0].children?.length ? $t('sys.pageDesigner.pleaseAddButton') : ''
      "
    >
      <div v-if="children[0]?.children?.length">
        <widget-wrapper
          class="inline-block"
          v-for="(item, index) in children[0].children"
          :key="item.id"
          :style="buttonMargin"
          :widget="item"
          :parentWidget="widget"
          :parentList="children[0].children"
          :index-of-parent-list="index"
          :actionTypes="actionTypes(item.type)"
        >
          <component :is="getAsyncWidget(item)" :widget="item" />
        </widget-wrapper>
      </div>
      <div>
        <widget-wrapper
          class="inline-block"
          v-for="(item, index) in children[1].children"
          :key="item.id"
          :style="buttonMargin"
          :widget="item"
          :parentWidget="widget"
          :parentList="children[1].children"
          :index-of-parent-list="index"
          :actionTypes="actionTypes(item.type)"
        >
          <component :is="getAsyncWidget(item)" :widget="item" />
        </widget-wrapper>
      </div>
    </div>
    <div
      v-else
      class="button-container-wrap"
      :style="{ 'text-align': align }"
      :class="{ 'no-children': !children.length }"
      :data-placeholder="!children.length ? $t('sys.pageDesigner.addOrDragButtonHere') : ''"
    >
      <widget-wrapper
        class="inline-block"
        v-for="(item, index) in children"
        :key="item.id"
        :style="buttonMargin"
        :widget="item"
        :parentWidget="widget"
        :parentList="children"
        :index-of-parent-list="index"
        :actionTypes="actionTypes(item.type)"
      >
        <component :is="getAsyncWidget(item)" :widget="item" />
      </widget-wrapper>
    </div>
  </div>
</template>

<script name="gct-button-process-container" setup lang="ts">
  import { toRefs, watch, toRef, inject, ref } from 'vue';
  import { ButtonProcessContainer, SubTable } from '/@page-designer/types/web';
  import { AGLINE_ENUMS } from '@/enums/designEnum';
  import WidgetDrag from '/@page-designer/components/widget-drag/widget-drag.vue';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { SCOPE, ButtonSize, ButtonStyle, FormComponents } from '/@page-designer/enum';
  import { useWidget } from '/@/projects/page-designer/src/hooks/useWidget';
  import { useSelectedWidget } from '/@/projects/page-designer/src/hooks/useSelectedWidget';
  import suspension from '/@page-designer/components/widget-drag/suspension.vue';

  const { emitCache, handleAddDrag, checkWidgetMove, widgetEntry, getAsyncWidget } = useDesigner();

  const props = defineProps<{ widget: ButtonProcessContainer }>();
  const { isWidgetSelected } = useWidget(props);
  const { setSelectedWidget } = useSelectedWidget();
  const scope: SCOPE = inject('scope') || SCOPE.PAGE;
  const btnContainerRef = ref();

  const { margin, align, buttonStyle, size } = toRefs(props.widget.props);

  const children = toRef(() => {
    props.widget.children.forEach((e) => {
      if (align.value === AGLINE_ENUMS.BETWEEN) {
        e.children?.forEach((f) => {
          f = oldBtnToNew(f);
        });
      } else {
        e = oldBtnToNew(e);
      }
    });
    return props.widget.children || [];
  });
  const buttonMargin = toRef(() => {
    return { marginLeft: margin.value / 2 + 'px', marginRight: margin.value / 2 + 'px' };
  });
  const containerMargin = toRef(() => {
    return { marginLeft: -margin.value / 2 + 'px', marginRight: -margin.value / 2 + 'px' };
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

  watch(buttonStyle, (newV) => {
    if (align.value === AGLINE_ENUMS.BETWEEN) {
      children.value[0].children?.map((e) => (e.props.buttonStyle = newV));
      children.value[1].children?.map((e) => (e.props.buttonStyle = newV));
    } else {
      children.value.map((e) => (e.props.buttonStyle = newV));
    }
  });
  watch(size, (newV) => {
    if (align.value === AGLINE_ENUMS.BETWEEN) {
      children.value[0].children?.map((e) => (e.props.size = newV));
      children.value[1].children?.map((e) => (e.props.size = newV));
    } else {
      children.value.map((e) => (e.props.size = newV));
    }
  });
  watch(align, (curr, old) => {
    if (curr === AGLINE_ENUMS.BETWEEN) {
      props.widget.children = [{ children: children.value }, { children: [] }];
    }
    if (old === AGLINE_ENUMS.BETWEEN) {
      props.widget.children = children.value.map((i) => i.children).flat();
    }
  });

  function actionTypes(type) {
    if (type === FormComponents.ProcessApproveButton) {
      return ['parent'];
    } else {
      return ['parent', 'delete'];
    }
  }
</script>

<style lang="less" scoped>
  // .button-container-design {
  //   min-width: 100px;
  // }

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

  .button-container-wrap {
    position: relative;
    min-height: 52px;
    overflow: visible;

    &::before {
      content: attr(data-placeholder);
      display: flex;
      position: absolute;
      top: 0;
      right: 0;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #5d6474;
      font-size: 14px;
      pointer-events: none;
    }

    &.no-children {
      background-color: #fbfbfc;
    }
  }
</style>
