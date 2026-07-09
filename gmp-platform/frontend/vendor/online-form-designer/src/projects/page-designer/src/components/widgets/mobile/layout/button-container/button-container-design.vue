<template>
  <div
    v-if="!isNewDesigner"
    ref="btnContainerRef"
    class="relative box-border overflow-visible"
    :class="[!children.length && 'is-empty']"
    :data-placeholder="t('sys.pageDesigner.pleaseAddButton')"
  >
    <div v-if="align === AGLINE_ENUMS.BETWEEN" class="ks-row-between">
      <div :style="containerMargin">
        <van-button
          v-for="item in leftChildren"
          :key="item.id"
          type="primary"
          size="small"
          :class="{ 'is-selected': selectedWidget.id === item.id }"
          :style="buttonMargin"
          @click.stop="selectWidget(item)"
          :buttonStyle="buttonStyle"
        >
          {{ item.props.title }}
        </van-button>
      </div>
      <div :style="containerMargin">
        <van-button
          v-for="item in rightChildren"
          :key="item.id"
          type="primary"
          size="small"
          :class="{ 'is-selected': selectedWidget.id === item.id }"
          :style="buttonMargin"
          @click.stop="selectWidget(item)"
        >
          {{ item.props.title }}
        </van-button>
      </div>
    </div>
    <div
      v-else
      :style="{ 'text-align': align }"
      class="button-container-wrap"
      :class="{ 'is-empty': !children.length }"
      :data-placeholder="!children.length ? t('sys.pageDesigner.addOrDragButtonHere') : ''"
    >
      <widget-drag
        :style="{ 'text-align': align, background: !children.length ? '#e6e9ef' : '' }"
        group="gct-sub-table-modal"
        :parentWidget="widget"
        :widgets="children"
        :isPut="isPut"
        @add="({ evt: { newIndex } }) => handleAddDrag(newIndex, children, SCOPE.PAGE)"
        @update="emitCache"
        @move="checkWidgetMove"
      >
        <template #default="slotProps">
          <!-- widget-wrapper -->
          <widget-wrapper
            :key="widget.id"
            :style="buttonMargin"
            :widget="slotProps.element"
            :parentWidget="widget"
            :parentList="children"
            :index-of-parent-list="slotProps.index"
          >
            <!-- widget-entry -->
            <component :is="widgetEntry" :widget="slotProps.element" v-slot="slotData">
              <!-- widget -->
              <component
                :is="getAsyncWidget(slotProps.element)"
                :widget="slotProps.element"
                v-bind="slotData || {}"
              />
            </component>
          </widget-wrapper>
        </template>
      </widget-drag>
    </div>
    <suspension
      v-if="isWidgetSelected && parentWidget"
      :rootRef="btnContainerRef"
      :layout="['upper']"
      :parent-widget="parentWidget"
    />
  </div>
  <ButtonContainerDesign2
    v-if="isNewDesigner === true"
    :widget="widget"
    :parentWidget="parentWidget"
  >
    <template #default="args">
      <slot v-bind="args"></slot>
    </template>
  </ButtonContainerDesign2>
</template>
<script name="gct-button-container" setup lang="ts">
  import { toRefs, watch, computed, toRef, ref } from 'vue';
  import { ButtonContainer } from '/@page-designer/types/mobile';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { AGLINE_ENUMS } from '@/enums/designEnum';
  import WidgetDrag from '/@page-designer/components/widget-drag/widget-drag.vue';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useWidget } from '/@page-designer/hooks/useWidget';
  import { SCOPE, FormComponents } from '/@page-designer/enum';
  import suspension from '/@page-designer/components/widget-drag/suspension.vue';
  import { ButtonContainerDesign2 } from './button-container-design2';

  const { t } = useI18n();
  const { emitCache, handleAddDrag, checkWidgetMove, widgetEntry, getAsyncWidget } = useDesigner();
  const { setSelectedWidget, selectedWidget } = useSelectedWidget();

  const btnContainerRef = ref();
  const props = defineProps<{
    widget: ButtonContainer;
    parentWidget: any;
    isNewDesigner: boolean;
  }>();
  const { isWidgetSelected } = useWidget(props);

  const children = toRef(() => props.widget.children || []);

  const { margin, align, buttonStyle } = toRefs(props.widget.props);

  const buttonMargin = toRef(() => {
    return { marginLeft: margin.value / 2 + 'px', marginRight: margin.value / 2 + 'px' };
  });
  const containerMargin = toRef(() => {
    return { marginLeft: -margin.value / 2 + 'px', marginRight: -margin.value / 2 + 'px' };
  });
  const leftChildren = computed(() => {
    return children.value[0]?.children || [];
  });
  const rightChildren = computed(() => {
    return children.value[1]?.children || [];
  });

  watch(align!, (curr, old) => {
    if (curr === AGLINE_ENUMS.BETWEEN) {
      // eslint-disable-next-line vue/no-mutating-props
      props.widget.children = [{ children: children.value } as any, { children: [] } as any];
    }
    if (old === AGLINE_ENUMS.BETWEEN) {
      // eslint-disable-next-line vue/no-mutating-props
      props.widget.children = children.value.map((i) => i.children).flat();
    }
  });

  function selectWidget(widget) {
    setSelectedWidget(widget);
  }

  const allowGroup = [
    FormComponents.CustomButton,
    FormComponents.ResetButton,
    FormComponents.SubmitButton,
  ];

  const subTableAllowGroup = [FormComponents.CustomButton];

  const isPut = (parentWidget, widget) => {
    return (parentWidget.preLocation ? subTableAllowGroup : allowGroup).includes(widget.type);
  };
</script>
<style lang="less" scoped>
  .is-empty {
    background: #e6e9ef;
  }
  .button-container-wrap {
    min-height: 40px;
    display: flex;
    align-items: center;
    position: relative;
    &.is-empty {
      margin: 0 12px;
      &::before {
        content: attr(data-placeholder);
        display: flex;
        position: absolute;
        top: 0;
        left: 0;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        // background-color: #fbfbfc;
        color: #969799;
        pointer-events: none;
      }
    }
    > div {
      flex: 1;
    }
  }

  .is-selected {
    border: 1px solid var(--ant-primary-color) !important;
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
</style>
