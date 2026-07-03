<template>
  <div class="gct-sub-table">
    <div class="bg-[#F6F7F9]">
      <van-cell
        class="sub-table-title-area sub-table-button-container"
        center
        title-style="padding-left: 12px"
        :border="false"
      >
        <template #title v-if="widget.props.displayLabelText">
          <div
            class="gct-sub-table--label"
            :class="{ 'van-field__label--required': widget.props.required }"
          >
            {{ widget.props.label || globFieldInfo.label }}
          </div>
        </template>
      </van-cell>
      <div
        class="sub-table-fields-area"
        :class="[!subFieldsWidget.length ? 'is-empty' : 'is-data']"
        :data-placeholder="t('sys.pageDesigner.selectSubTableField')"
      >
        <div v-if="!isNewDesigner" class="fields-container">
          <widget-wrapper
            v-for="(subField, index) in subFieldsWidget"
            :key="subField.id"
            :widget="subField"
            :parent-list="subFieldsWidget"
            :parent-widget="widget"
            :index-of-parent-list="index"
            :actionTypes="['parent']"
          >
            <component :is="widgetEntry" :widget="subField" v-slot="slotData">
              <component
                :is="getAsyncWidget(subField)"
                :widget="subField"
                :rowReadonly="editMode === SUB_TABLE_EDIT_MODE.MODAL"
                v-bind="slotData || {}"
              />
            </component>
          </widget-wrapper>
        </div>
        <slot
          v-if="isNewDesigner"
          :parentWidget="widget"
          :children="subFieldsWidget"
          :config="{ type: 'sub-table-design', direction: 'horizontal' }"
        ></slot>
      </div>
      <div v-if="dropFieldsWidget?.children?.length" class="gct-card-footer">
        <tableButtons
          :parent-widget="widget"
          :children="dropFieldsWidget.children"
          :visibleButtons="dropFieldsWidget.props.visibleButtons"
        />
      </div>
    </div>
    <div v-if="btnGroupWidget?.children?.length" class="pt5px pb5px">
      <groupButtons
        :children="btnGroupWidget.children"
        :parentWidget="widget"
        :visibleButtons="btnGroupWidget.visibleButtons"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-sub-table">
  import { inject, computed, toRefs, onMounted, toRef, provide } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import { SCOPE, SUB_TABLE_EDIT_MODE } from '/@page-designer/enum';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useAsyncFieldConfig } from '/@page-designer/components/widgets/hooks/useAsyncFields';
  import { transformButtons } from './modals/transform';
  import tableButtons from '/@page-designer/components/widgets/mobile/__components__/table-buttons/table-buttons-design.vue';
  import groupButtons from '/@page-designer/components/widgets/mobile/__components__/group-buttons/group-buttons-design.vue';

  const globFieldInfo = inject<any>('globFieldInfo', {});

  const scope: SCOPE = inject('scope') || SCOPE.PAGE;
  const { t } = useI18n();

  const props = defineProps(widgetProps);

  const { visibleButtons, editMode } = toRefs(props.widget.props);

  const { labelFont } = useStyle(props.widget);

  const subLabelLayout = toRef(() => {
    const width =
      props.widget.props.layout?.label === 'left' && !!props.widget.props.hasLabelWidth
        ? props.widget.props.labelWidth + (props.widget.props.labelType == 'percent' ? '%' : 'px')
        : '';

    return {
      width,
      layout: props.widget.props.layout,
      hasLabelWidth: props.widget.props.hasLabelWidth,
      overLabelDisplay: props.widget.props.overLabelDisplay,
    };
  });
  provide('subLabelLayout', subLabelLayout);

  const { getAsyncWidget, widgetEntry } = useDesigner();

  const btnGroupWidget = computed(() => {
    return props.widget.children![2];
  });

  const subFieldsWidget = computed(() => {
    return props.widget.children![3].children;
  });

  const dropFieldsWidget = computed(() => {
    return props.widget.children![1];
  });
  if (dropFieldsWidget.value?.id) {
    transformButtons(dropFieldsWidget.value?.children);
    dropFieldsWidget.value.id = undefined;
  }
  if (btnGroupWidget.value?.id) {
    btnGroupWidget.value.id = undefined;
  }
  useAsyncFieldConfig(props.widget);
</script>

<style lang="less" scoped>
  .gct-sub-table {
    width: 100%;

    :deep(.ant-form-item) {
      pointer-events: none;

      .van-cel {
        padding: 0 !important;
      }
    }

    .sub-table-title-area.van-cell {
      padding: 0;

      :deep(> .van-cell__title) {
        box-sizing: border-box;
        flex: none;
        width: var(--van-field-label-width);
        margin-right: var(--van-field-label-margin-right);
        color: var(--van-field-label-color);
        text-align: left;
        word-wrap: break-word;

        .gct-sub-table--label {
          color: v-bind('labelFont.color');
          font-size: v-bind('labelFont.fontSize');
          font-style: v-bind('labelFont.fontStyle');
          font-weight: v-bind('labelFont.fontWeight');
          text-align: v-bind('labelFont?.textAlign');
          text-decoration-line: v-bind('labelFont.textDecorationLine');
        }
      }

      :deep(> .van-cell__value) {
        padding: 2px;
        overflow: visible;
      }
    }

    .is-button-container-selected {
      outline: var(--ant-primary-color) solid 2px;
    }

    :deep(.active) {
      background-color: rgb(13 170 156 / 10%);
    }

    .sub-table-fields-area {
      position: relative;
      min-height: 96px;

      &.is-data {
        padding-top: 6px;
        // background-color: #f9f9f9;
        .fields-container {
          // background-color: #fff;
          padding: 1px;
        }
      }

      &.is-empty {
        margin: 8px 12px 0;

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
          background-color: #f9f9f9;
          color: #bfbfbf;
          pointer-events: none;
        }
      }
    }

    .gct-card-footer {
      display: flex;
      padding: 8px 12px;

      .footer-btn-wrap {
        display: flex;
        flex: 1;
        flex-direction: row-reverse;
      }

      .btn-more {
        margin-left: 8px;
        line-height: 32px;
      }
    }
  }

  .sub-table-button-container {
    overflow: visible;
  }

  :deep(.van-cell) {
    background-color: transparent;
  }
</style>
